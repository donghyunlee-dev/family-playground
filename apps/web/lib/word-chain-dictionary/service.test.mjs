import assert from "node:assert/strict";
import test from "node:test";
import {
  detectWordLanguage,
  normalizeDictionaryWord,
  validateWordAgainstDictionary,
} from "./service.ts";

test("detectWordLanguage classifies Korean, English, mixed, and unknown words", () => {
  assert.equal(detectWordLanguage("기차"), "ko");
  assert.equal(detectWordLanguage("Train"), "en");
  assert.equal(detectWordLanguage("기차train"), "mixed");
  assert.equal(detectWordLanguage("1234"), "unknown");
});

test("normalizeDictionaryWord lowercases English words only", () => {
  assert.equal(normalizeDictionaryWord("Train", "en"), "train");
  assert.equal(normalizeDictionaryWord("기차", "ko"), "기차");
});

test("validateWordAgainstDictionary rejects mixed and unsupported words before provider calls", async () => {
  const mixed = await validateWordAgainstDictionary("기차train", "ko-en");
  assert.equal(mixed.ok, false);
  assert.equal(mixed.code, "MIXED_LANGUAGE_NOT_ALLOWED");

  const unsupported = await validateWordAgainstDictionary("1234", "ko-en");
  assert.equal(unsupported.ok, false);
  assert.equal(unsupported.code, "UNSUPPORTED_LANGUAGE");
});

test("validateWordAgainstDictionary allows bypass mode for development", async () => {
  const result = await validateWordAgainstDictionary("기차", "off");
  assert.equal(result.ok, true);
  assert.equal(result.dictionarySource, "disabled");
});
