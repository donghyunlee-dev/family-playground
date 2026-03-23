import { getWordChainDictionaryConfig } from "./env";
import type {
  DictionaryMode,
  ValidateWordFailure,
  ValidateWordResponse,
  ValidateWordSuccess,
  WordLanguage,
} from "./types";

const hangulWordPattern = /^[가-힣]+$/;
const englishWordPattern = /^[a-zA-Z]+$/;

function failure(
  code: ValidateWordFailure["code"],
  message: string,
  normalizedWord: string,
  language: WordLanguage,
  retryable = false,
): ValidateWordFailure {
  return {
    ok: false,
    code,
    message,
    normalizedWord,
    language,
    retryable,
  };
}

export function detectWordLanguage(word: string): WordLanguage {
  if (hangulWordPattern.test(word)) {
    return "ko";
  }

  if (englishWordPattern.test(word)) {
    return "en";
  }

  if (/[가-힣]/.test(word) && /[a-zA-Z]/.test(word)) {
    return "mixed";
  }

  return "unknown";
}

export function normalizeDictionaryWord(word: string, language: WordLanguage) {
  const trimmed = word.trim();

  if (language === "en") {
    return trimmed.toLowerCase();
  }

  return trimmed;
}

function isModeAllowed(language: WordLanguage, mode: DictionaryMode) {
  if (mode === "off") {
    return true;
  }

  if (language === "mixed") {
    return false;
  }

  if (mode === "ko-only") {
    return language === "ko";
  }

  if (mode === "en-only") {
    return language === "en";
  }

  return language === "ko" || language === "en";
}

function withTimeout(timeoutMs: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  return {
    signal: controller.signal,
    clear: () => clearTimeout(timer),
  };
}

function extractKoreanDictionaryItems(xml: string) {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((match) => match[1] ?? "");
}

function decodeXmlEntities(value: string) {
  return value
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");
}

async function validateKoreanWord(word: string) {
  const config = getWordChainDictionaryConfig();

  if (!config.koreanProviderKey) {
    return failure(
      "DICTIONARY_UNAVAILABLE",
      "국어사전 API 키가 설정되지 않았습니다.",
      word,
      "ko",
      true,
    );
  }

  const params = new URLSearchParams({
    key: config.koreanProviderKey,
    q: word,
    part: "word",
    method: "exact",
    translated: "n",
    type1: "word",
    num: "10",
    start: "1",
  });
  const timeout = withTimeout(config.timeoutMs);

  try {
    const response = await fetch(
      `${config.koreanProviderUrl}?${params.toString()}`,
      {
        headers: {
          Accept: "application/xml,text/xml;q=0.9,*/*;q=0.8",
        },
        signal: timeout.signal,
      },
    );

    if (!response.ok) {
      return failure(
        "DICTIONARY_UNAVAILABLE",
        "국어사전 검증 서버에 연결할 수 없습니다.",
        word,
        "ko",
        true,
      );
    }

    const xml = await response.text();
    const items = extractKoreanDictionaryItems(xml);
    const found = items.some((item) => {
      const match = item.match(/<word>([^<]+)<\/word>/);
      return decodeXmlEntities(match?.[1]?.trim() ?? "") === word;
    });

    if (!found) {
      return failure(
        "KO_WORD_NOT_FOUND",
        "국어사전에서 찾을 수 없는 단어입니다.",
        word,
        "ko",
      );
    }

    const result: ValidateWordSuccess = {
      ok: true,
      normalizedWord: word,
      language: "ko",
      dictionarySource: "krdict",
      validation: {
        dictionaryValid: true,
        ruleValid: true,
      },
    };

    return result;
  } catch (error) {
    return failure(
      error instanceof DOMException && error.name === "AbortError"
        ? "VALIDATION_TIMEOUT"
        : "DICTIONARY_UNAVAILABLE",
      error instanceof DOMException && error.name === "AbortError"
        ? "국어사전 검증 시간이 초과되었습니다."
        : "국어사전 검증 서버에 일시적으로 연결할 수 없습니다.",
      word,
      "ko",
      true,
    );
  } finally {
    timeout.clear();
  }
}

async function validateEnglishWord(word: string) {
  const config = getWordChainDictionaryConfig();
  const timeout = withTimeout(config.timeoutMs);

  try {
    const response = await fetch(
      `${config.englishProviderUrl}/${encodeURIComponent(word)}`,
      {
        headers: {
          Accept: "application/json",
        },
        signal: timeout.signal,
      },
    );

    if (response.status === 404) {
      return failure(
        "EN_WORD_NOT_FOUND",
        "영어 사전에 없는 단어입니다.",
        word,
        "en",
      );
    }

    if (!response.ok) {
      return failure(
        "DICTIONARY_UNAVAILABLE",
        "영어 사전 검증 서버에 연결할 수 없습니다.",
        word,
        "en",
        true,
      );
    }

    const payload = (await response.json()) as unknown;

    if (!Array.isArray(payload) || payload.length === 0) {
      return failure(
        "EN_WORD_NOT_FOUND",
        "영어 사전에 없는 단어입니다.",
        word,
        "en",
      );
    }

    const result: ValidateWordSuccess = {
      ok: true,
      normalizedWord: word,
      language: "en",
      dictionarySource: "dictionaryapi.dev",
      validation: {
        dictionaryValid: true,
        ruleValid: true,
      },
    };

    return result;
  } catch (error) {
    return failure(
      error instanceof DOMException && error.name === "AbortError"
        ? "VALIDATION_TIMEOUT"
        : "DICTIONARY_UNAVAILABLE",
      error instanceof DOMException && error.name === "AbortError"
        ? "영어 사전 검증 시간이 초과되었습니다."
        : "영어 사전 검증 서버에 일시적으로 연결할 수 없습니다.",
      word,
      "en",
      true,
    );
  } finally {
    timeout.clear();
  }
}

export async function validateWordAgainstDictionary(
  rawWord: string,
  requestedMode?: DictionaryMode,
): Promise<ValidateWordResponse> {
  const config = getWordChainDictionaryConfig();
  const mode = requestedMode ?? config.mode;
  const trimmedWord = rawWord.trim();

  if (!trimmedWord) {
    return failure("EMPTY_WORD", "빈 단어는 제출할 수 없습니다.", "", "unknown");
  }

  if (trimmedWord.length < 2) {
    return failure(
      "WORD_TOO_SHORT",
      "두 글자 이상 입력해 주세요.",
      trimmedWord,
      "unknown",
    );
  }

  const language = detectWordLanguage(trimmedWord);
  const normalizedWord = normalizeDictionaryWord(trimmedWord, language);

  if (mode === "off") {
    return {
      ok: true,
      normalizedWord,
      language,
      dictionarySource: "disabled",
      validation: {
        dictionaryValid: true,
        ruleValid: true,
      },
    };
  }

  if (language === "mixed") {
    return failure(
      "MIXED_LANGUAGE_NOT_ALLOWED",
      "한글과 영어를 섞은 단어는 사용할 수 없습니다.",
      normalizedWord,
      language,
    );
  }

  if (language === "unknown" || !isModeAllowed(language, mode)) {
    return failure(
      "UNSUPPORTED_LANGUAGE",
      "허용되지 않는 언어 형식의 단어입니다.",
      normalizedWord,
      language,
    );
  }

  if (language === "ko") {
    return validateKoreanWord(normalizedWord);
  }

  return validateEnglishWord(normalizedWord);
}
