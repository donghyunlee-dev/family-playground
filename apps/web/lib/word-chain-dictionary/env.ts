import type { DictionaryMode } from "./types";

const allowedModes = new Set<DictionaryMode>([
  "ko-only",
  "en-only",
  "ko-en",
  "off",
]);

export function getWordChainDictionaryConfig() {
  const mode =
    (process.env.WORD_CHAIN_DICTIONARY_MODE as DictionaryMode | undefined) ??
    "ko-en";

  return {
    mode: allowedModes.has(mode) ? mode : "ko-en",
    koreanProviderUrl:
      process.env.WORD_CHAIN_KO_PROVIDER_URL ??
      "https://krdict.korean.go.kr/api/search",
    koreanProviderKey: process.env.WORD_CHAIN_KO_PROVIDER_KEY ?? "",
    englishProviderUrl:
      process.env.WORD_CHAIN_EN_PROVIDER_URL ??
      "https://api.dictionaryapi.dev/api/v2/entries/en",
    timeoutMs: Number(process.env.WORD_CHAIN_VALIDATE_TIMEOUT_MS ?? "2500"),
  };
}
