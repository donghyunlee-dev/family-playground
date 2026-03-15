"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function GoogleSignInButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
      }
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "구글 로그인을 시작하지 못했습니다.",
      );
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        className="inline-flex w-full items-center justify-center rounded-full border border-[#ffd58c] bg-[#ffd666] px-6 py-3 text-sm font-medium text-[#25314b] shadow-[0_16px_40px_rgba(251,191,36,0.22)] transition hover:bg-[#ffc94f] hover:text-[#1f2a44] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        disabled={loading}
        onClick={handleClick}
        type="button"
      >
        {loading ? "구글 로그인으로 이동 중..." : "구글 계정으로 로그인"}
      </button>
      {error ? (
        <p className="rounded-[1.4rem] bg-rose-100 px-4 py-3 text-sm text-rose-900">
          {error}
        </p>
      ) : null}
    </div>
  );
}
