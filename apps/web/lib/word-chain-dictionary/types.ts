export type DictionaryMode = "ko-only" | "en-only" | "ko-en" | "off";

export type WordLanguage = "ko" | "en" | "mixed" | "unknown";

export type DictionaryErrorCode =
  | "EMPTY_WORD"
  | "WORD_TOO_SHORT"
  | "UNSUPPORTED_LANGUAGE"
  | "MIXED_LANGUAGE_NOT_ALLOWED"
  | "KO_WORD_NOT_FOUND"
  | "EN_WORD_NOT_FOUND"
  | "DICTIONARY_UNAVAILABLE"
  | "VALIDATION_TIMEOUT";

export interface ValidateWordRequest {
  word: string;
  requiredChar?: string | null;
  usedWords?: string[];
  dictionaryMode?: DictionaryMode;
  roomId?: string | null;
  sessionId?: string | null;
}

export interface ValidateWordSuccess {
  ok: true;
  normalizedWord: string;
  language: WordLanguage;
  dictionarySource: string;
  validation: {
    dictionaryValid: true;
    ruleValid: true;
  };
}

export interface ValidateWordFailure {
  ok: false;
  code: DictionaryErrorCode;
  message: string;
  normalizedWord: string;
  language: WordLanguage;
  retryable: boolean;
}

export type ValidateWordResponse = ValidateWordSuccess | ValidateWordFailure;
