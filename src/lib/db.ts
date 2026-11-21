import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  // Provide a dummy connection string in build/CI environments when DATABASE_URL is missing
  // to prevent 'DATABASE_URL is required' crash during Next.js static compile scanning.
  const activeString = connectionString || "postgresql://dummy_user:dummy_pass@localhost:5432/dummy_db?sslmode=require";

  const adapter = new PrismaPg({
    connectionString: activeString,
    // Self-hosted PostgreSQL on the same server: a modest persistent pool is
    // cheaper than reconnecting on every request now that search is public.
    max: Number(process.env.DATABASE_POOL_MAX || 10),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
