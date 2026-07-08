import { auth, currentUser } from "@clerk/nextjs/server";
import { env } from "@/lib/env";
import { prisma } from "@/lib/db";

export async function getCurrentAppUser() {
  const session = await auth();
  if (!session.userId) return null;

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress;

  if (!email) return null;

  const appUser = await prisma.user.upsert({
    where: { clerkId: session.userId },
    update: {
      email,
      name: clerkUser?.fullName || clerkUser?.firstName || null,
    },
    create: {
      clerkId: session.userId,
      email,
      name: clerkUser?.fullName || clerkUser?.firstName || null,
    },
  });

  const adminEmails = (env.ADMIN_EMAILS || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  if (adminEmails.includes(email.toLowerCase())) {
    await prisma.adminProfile.upsert({
      where: { userId: appUser.id },
      update: { isActive: true },
      create: { userId: appUser.id, role: "OWNER", isActive: true },
    });
  }

  return appUser;
}

export async function requireAppUser() {
  const user = await getCurrentAppUser();
  if (!user) {
    throw new Error("Authentication required.");
  }
  return user;
}

export async function requireAdminUser() {
  const user = await requireAppUser();
  const admin = await prisma.adminProfile.findUnique({
    where: { userId: user.id },
  });

  if (!admin?.isActive) {
    throw new Error("Admin access required.");
  }

  return { user, admin };
}
