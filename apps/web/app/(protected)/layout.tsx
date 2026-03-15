import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { requireAppSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const { profile } = await requireAppSession();

  return <AppShell profile={profile}>{children}</AppShell>;
}
