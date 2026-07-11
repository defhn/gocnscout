import { auth, currentUser } from "@clerk/nextjs/server";
import { env } from "@/lib/env";
import { prisma } from "@/lib/db";

export async function getCurrentAppUser() {
  const session = await auth();
  if (!session.userId) return null;

  // 1. Check database first to avoid slow Clerk HTTP requests and write queries on every single request
  let appUser = await prisma.user.findUnique({
    where: { clerkId: session.userId },
  });

  if (appUser) {
    return appUser;
  }

  // 2. Fallback to slow Clerk API only if user profile is not built in our database yet
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress;

  if (!email) return null;

  const userName = clerkUser?.fullName || clerkUser?.firstName || null;

  const existingUserByEmail = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUserByEmail) {
    console.log(`[Auth] Clerk ID mismatch for email ${email}. Updating clerkId from ${existingUserByEmail.clerkId} to ${session.userId}`);
    appUser = await prisma.user.update({
      where: { id: existingUserByEmail.id },
      data: {
        clerkId: session.userId,
        name: userName,
      },
    });
  } else {
    appUser = await prisma.user.create({
      data: {
        clerkId: session.userId,
        email,
        name: userName,
      },
    });
  }

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
