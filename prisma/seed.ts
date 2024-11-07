import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.createMany({
    data: [
      { email: 'bob@example.com', password: 'test', id: '1' },
      { email: 'carol@example.com', password: 'test', id: '2' },
    ],
  });

  const links = await prisma.link.createMany({
    data: [
      {
        originalUrl: 'google.com',
        shortUrl: 'google.com',
        userId: '1',
        id: '999',
      },
      {
        originalUrl: 'youtube.com',
        shortUrl: 'youtube.com',
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
