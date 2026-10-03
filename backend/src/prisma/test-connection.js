import prisma from "./client.js";

try {
  await prisma.$connect();

  console.log("✅ PostgreSQL connected successfully through Prisma");

  await prisma.$disconnect();
} catch (error) {
  console.error("❌ PostgreSQL connection failed:");
  console.error(error);

  await prisma.$disconnect();
  process.exit(1);
}