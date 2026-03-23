import { NextResponse } from "next/server";
import { validateWordAgainstDictionary } from "@/lib/word-chain-dictionary/service";
import type { ValidateWordRequest } from "@/lib/word-chain-dictionary/types";

export async function POST(request: Request) {
  let payload: ValidateWordRequest;

  try {
    payload = (await request.json()) as ValidateWordRequest;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        code: "DICTIONARY_UNAVAILABLE",
        message: "단어 검증 요청 형식이 올바르지 않습니다.",
        normalizedWord: "",
        language: "unknown",
        retryable: false,
      },
      { status: 400 },
    );
  }

  const result = await validateWordAgainstDictionary(
    payload.word ?? "",
    payload.dictionaryMode,
  );

  return NextResponse.json(result, { status: result.ok ? 200 : 200 });
}
