import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { CCTV_CAMERAS } from './app/data/cctv';

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting seeding...');

  for (const camera of CCTV_CAMERAS) {
    await prisma.cCTV.upsert({
      where: { slug: camera.id },
      update: {
        name: camera.name,
        latitude: camera.latitude,
        longitude: camera.longitude,
        streamUrl: camera.streamUrl,
        status: camera.status,
      },
      create: {
        slug: camera.id,
        name: camera.name,
        latitude: camera.latitude,
        longitude: camera.longitude,
        streamUrl: camera.streamUrl,
        status: camera.status,
      },
    });
    console.log(`Seeded ${camera.name}`);
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
