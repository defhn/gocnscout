import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getCurrentAppUser } from "@/server/auth";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentAppUser();
  if (!user) redirect("/sign-in");
  return <DashboardShell>{children}</DashboardShell>;
}
