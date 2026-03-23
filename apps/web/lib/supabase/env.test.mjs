import assert from "node:assert/strict";
import test from "node:test";
import { getRequiredEnv, getMissingEnvKeys } from "./env.ts";

test("getMissingEnvKeys reports absent keys", () => {
  assert.deepEqual(
    getMissingEnvKeys(
      {
        NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
      },
      ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"],
    ),
    ["NEXT_PUBLIC_SUPABASE_ANON_KEY"],
  );
});

test("getRequiredEnv returns requested values", () => {
  const values = getRequiredEnv(
    {
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
    },
    ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"],
  );

  assert.deepEqual(values, {
    NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
  });
});

test("getRequiredEnv throws with the missing key list", () => {
  assert.throws(
    () =>
      getRequiredEnv(
        {
          NEXT_PUBLIC_SUPABASE_URL: "",
        },
        ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"],
      ),
    /Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY/,
  );
});
