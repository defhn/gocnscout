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

  const adapter = new PrismaPg({ connectionString: activeString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
