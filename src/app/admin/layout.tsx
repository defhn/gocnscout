import { redirect } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { getCurrentAppUser } from "@/server/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentAppUser();
  if (!user) redirect("/sign-in");
  const admin = await prisma.adminProfile.findUnique({ where: { userId: user.id } });
  if (!admin?.isActive) redirect("/app");
  return <AdminShell>{children}</AdminShell>;
}
