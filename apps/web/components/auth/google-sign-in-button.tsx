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
        className="inline-flex items-center justify-center rounded-full border border-[#ffd58c] bg-[linear-gradient(135deg,_#fff7e2_0%,_#ffd972_100%)] px-6 py-3 text-sm font-medium text-[#25314b] shadow-[0_16px_40px_rgba(251,191,36,0.22)] transition hover:bg-[linear-gradient(135deg,_#fff1c4_0%,_#ffc94f_100%)] hover:text-[#1f2a44] disabled:cursor-not-allowed disabled:opacity-60"
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
