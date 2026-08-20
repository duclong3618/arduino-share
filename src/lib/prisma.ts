import { PrismaClient } from "@prisma/client";

// Only create PrismaClient when DATABASE_URL is available (not during static build)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    // Return a dummy client during build — actual calls will fail at runtime
    // which is fine since API routes are server-side only
    return new PrismaClient({
      datasources: { db: { url: "postgresql://dummy:dummy@localhost:5432/dummy" } },
    });
  }
  return new PrismaClient();
}

export default globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = globalForPrisma.prisma;
