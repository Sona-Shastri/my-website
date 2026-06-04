import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const [, , emailArg, password, ...nameParts] = process.argv;

async function main() {
  if (!emailArg || !password) {
    console.error('Usage: npm run add-user -- <email> <password> "<Full Name>"');
    process.exit(1);
  }
  const email = emailArg.trim().toLowerCase();
  const name = nameParts.join(" ").trim() || email.split("@")[0];
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    create: { email, name, passwordHash },
    update: { name, passwordHash },
  });
  console.log(`✅ Account ready: ${user.email} (${user.name})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
