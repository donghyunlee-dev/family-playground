import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureFamilyAccess } from "@/lib/platform";

export async function requireAppSession() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const access = await ensureFamilyAccess(user);

  if (!access.allowed) {
    await supabase.auth.signOut();
    redirect(`/login?error=${access.reason}`);
  }

  return {
    user,
    profile: access.profile,
    member: access.member,
  };
}
