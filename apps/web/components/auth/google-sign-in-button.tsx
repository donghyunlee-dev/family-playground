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
          : "Unable to start Google sign-in.",
      );
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,_#0f172a_0%,_#1d4ed8_100%)] px-6 py-3 text-sm font-medium text-white shadow-[0_16px_40px_rgba(37,99,235,0.18)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={loading}
        onClick={handleClick}
        type="button"
      >
        {loading ? "Redirecting to Google..." : "Continue with Google"}
      </button>
      {error ? (
        <p className="rounded-[1.4rem] bg-rose-100 px-4 py-3 text-sm text-rose-900">
          {error}
        </p>
      ) : null}
    </div>
  );
}
