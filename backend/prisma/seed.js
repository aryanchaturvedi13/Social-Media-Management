import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
const prisma = new PrismaClient()

async function main() {
  // Create 5 users
  const user1 = await prisma.user.upsert({
    where: { username: "user1" },
    update: {},
    create: { username: "user1", name: "user1", email: "user1@gmail.com", passwordHashed: await bcrypt.hash("password1", 10), accountType: "PRIVATE"},
  })

  const user2 = await prisma.user.upsert({
    where: { username: "user2" },
    update: {},
    create: { username: "user2", name: "user2", email: "user2@gmail.com", passwordHashed: await bcrypt.hash("password2", 10), accountType: "PRIVATE"},
  })

  const user3 = await prisma.user.upsert({
    where: { username: "user3" },
    update: {},
    create: { username: "user3", name: "user3", email: "user3@gmail.com", passwordHashed: await bcrypt.hash("password3", 10), accountType: "PRIVATE"},
  })

  const user4 = await prisma.user.upsert({
    where: { username: "user4" },
    update: {},
    create: { username: "user4", name: "user4", email: "user4@gmail.com", passwordHashed: await bcrypt.hash("password4", 10),accountType: "PRIVATE"},
  })

  const user5 = await prisma.user.upsert({
    where: { username: "user5" },
    update: {},
    create: { username: "user5", name: "user5", email: "user5@gmail.com", passwordHashed: await bcrypt.hash("password5", 10), accountType: "PRIVATE"},
  })

  // Make all users (2–5) follow user1
  await prisma.follows.createMany({
    data: [
      { followerId: user2.id, followingId: user1.id },
      { followerId: user3.id, followingId: user1.id },
      { followerId: user4.id, followingId: user1.id },
      { followerId: user5.id, followingId: user1.id },
    ],
    skipDuplicates: true,
  })

  console.log("✅ Seed data created successfully")
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error(err)
    prisma.$disconnect()
  })