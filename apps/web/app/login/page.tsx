import { redirect } from "next/navigation";
import { SectionCard } from "@family-playground/ui";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureFamilyAccess } from "@/lib/platform";

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
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.16),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.14),_transparent_30%),linear-gradient(180deg,_#fff8ef_0%,_#fffdf8_45%,_#f0ece3_100%)] px-6 py-10 text-stone-900">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <SectionCard
          eyebrow="Login"
          title="Sign in with your family Google account"
          description="Protected routes require both a valid Google session and an approved family allowlist entry."
        >
          <GoogleSignInButton />
          {error ? (
            <div className="mt-4 rounded-2xl bg-rose-100 px-4 py-3 text-sm text-rose-900">
              {errorMessages[error] ?? "Unable to continue sign-in."}
            </div>
          ) : null}
        </SectionCard>

        <SectionCard
          eyebrow="Access Policy"
          title="What happens after sign-in"
          description="The platform checks the family allowlist, bootstraps the profile row, restores the session, and only then opens lobby access."
        >
          <div className="space-y-3 text-sm leading-6 text-stone-700">
            <div className="rounded-2xl bg-stone-50 px-4 py-3">
              1. Google OAuth returns to Supabase callback.
            </div>
            <div className="rounded-2xl bg-stone-50 px-4 py-3">
              2. The app checks `family_members` for an approved email.
            </div>
            <div className="rounded-2xl bg-stone-50 px-4 py-3">
              3. `profiles` is created or updated with the current identity.
            </div>
            <div className="rounded-2xl bg-stone-50 px-4 py-3">
              4. Protected pages restore your session on every visit.
            </div>
          </div>
        </SectionCard>
      </div>
    </main>
  );
}
