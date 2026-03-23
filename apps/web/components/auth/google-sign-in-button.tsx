"use client";

import { useState } from "react";

interface GoogleSignInButtonProps {
  next?: string;
  className?: string;
  label?: string;
}

export function GoogleSignInButton({
  next = "/lobby",
  className,
  label = "구글 계정으로 로그인",
}: GoogleSignInButtonProps) {
  const [isPending, setIsPending] = useState(false);

  function handleClick() {
    setIsPending(true);
    window.location.assign(
      `/auth/sign-in?next=${encodeURIComponent(next)}&force=1`,
    );
  }

  return (
    <button
      className={
        className ??
        "inline-flex w-full items-center justify-center rounded-full border border-[#ffd58c] bg-[#ffd666] px-6 py-3 text-sm font-medium text-[#25314b] shadow-[0_16px_40px_rgba(251,191,36,0.22)] transition hover:bg-[#ffc94f] hover:text-[#1f2a44] sm:w-auto"
      }
      aria-busy={isPending}
      disabled={isPending}
      onClick={handleClick}
      type="button"
    >
      {isPending ? "이동 중..." : label}
    </button>
  );
}
