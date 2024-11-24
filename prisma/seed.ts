import { PrismaClient } from '@prisma/client';
import { encodePassword } from '../src/utils/bcrypt';

const prisma = new PrismaClient();

async function main() {
  const SEED_USERS_PASSWORD = process.env.SEED_USERS_PASSWORD;

  const users = await prisma.user.createMany({
    data: [
      {
        email: 'bob@example.com',
        password: encodePassword(SEED_USERS_PASSWORD),
        id: '1',
      },
      {
        email: 'carol@example.com',
        password: encodePassword(SEED_USERS_PASSWORD),
        id: '2',
      },
    ],
  });

  const links = await prisma.link.createMany({
    data: [
      {
        originalUrl: 'google.com',
        shortUrlCode: 'gr',
        userId: '1',
        id: '999',
      },
      {
        originalUrl: 'youtube.com',
        shortUrlCode: 'yt',
        userId: '2',
        id: '998',
      },
    ],
  });

  console.log(users, links);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
