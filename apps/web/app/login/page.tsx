import { redirect } from "next/navigation";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { buildSignedOutLoginHref } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureFamilyAccess } from "@/lib/platform";

export const dynamic = "force-dynamic";

const errorMessages: Record<string, string> = {
  "not-allowed":
    "This Google account is not on the family allowlist yet. Add the email to family_members before retrying.",
  "email-claimed":
    "This family email is already linked to another user id. Check the allowlist and try again.",
  "missing-email": "The authenticated account did not provide an email address.",
  "missing-code": "Google sign-in did not return an authorization code.",
  "auth-callback-failed":
    "Supabase could not exchange the Google callback for a session.",
};

interface LoginPageProps {
  searchParams: Promise<{
    error?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const access = await ensureFamilyAccess(user);

    if (access.allowed) {
      redirect("/lobby");
    }

    redirect(buildSignedOutLoginHref(access.reason));
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#e8f1ff_0%,_#f8fbff_40%,_#f6f1e8_100%)] px-5 py-6 text-slate-950 md:px-8 md:py-8">
      <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[2.25rem] bg-[linear-gradient(135deg,_#0f172a_0%,_#1d4ed8_48%,_#22d3ee_100%)] p-7 text-white shadow-[0_30px_90px_rgba(37,99,235,0.18)] md:p-10">
          <p className="text-xs uppercase tracking-[0.3em] text-sky-100/90">
            Private Access
          </p>
          <h1 className="mt-5 max-w-2xl text-5xl font-semibold tracking-[-0.04em] text-balance">
            Sign in once and keep the family hub ready.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-sky-50/88">
            Google OAuth opens the platform, the family access rule confirms the
            account, and the profile row is restored so rooms and rankings stay
            attached to the same person across sessions.
          </p>
          <div className="mt-8 grid gap-3 md:grid-cols-3">
            <div className="rounded-[1.5rem] border border-white/15 bg-white/8 px-4 py-4">
              <p className="text-sm font-medium text-white">OAuth callback</p>
              <p className="mt-2 text-sm leading-6 text-sky-50/75">
                Supabase exchanges the Google code for a browser session.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/15 bg-white/8 px-4 py-4">
              <p className="text-sm font-medium text-white">Family access</p>
              <p className="mt-2 text-sm leading-6 text-sky-50/75">
                The account is matched to the family membership table.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/15 bg-white/8 px-4 py-4">
              <p className="text-sm font-medium text-white">Profile restore</p>
              <p className="mt-2 text-sm leading-6 text-sky-50/75">
                Display name, activity state, and ranking context are updated.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[2.25rem] border border-white/70 bg-white/82 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur md:p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-sky-700">
            Continue
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-950">
            Family Google account only
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Use one of the family Google accounts you already connected to
            Supabase. After login, the platform will send you to the lobby if
            the account is allowed.
          </p>
          <div className="mt-6">
            <GoogleSignInButton />
          </div>
          {error ? (
            <div className="mt-4 rounded-[1.5rem] bg-rose-50 px-4 py-4 text-sm leading-6 text-rose-900">
              {errorMessages[error] ?? "Unable to continue sign-in."}
            </div>
          ) : null}
          <div className="mt-6 rounded-[1.5rem] bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-600">
            Session restore is enabled, so returning users should come back to
            the protected app without repeating the full flow every time.
          </div>
        </section>
      </div>
    </main>
  );
}
