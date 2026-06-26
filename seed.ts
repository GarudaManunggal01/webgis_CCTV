import { PrismaClient } from "@prisma/client";
import "dotenv/config";
import { CCTV_CAMERAS } from "./app/data/cctv";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seeding...");

  for (const camera of CCTV_CAMERAS) {
    await prisma.cCTV.upsert({
      where: { slug: camera.id },
      update: {
        name: camera.name,
        latitude: camera.latitude,
        longitude: camera.longitude,
        streamurl: camera.streamurl,
        status: camera.status,
      },
      create: {
        slug: camera.id,
        name: camera.name,
        latitude: camera.latitude,
        longitude: camera.longitude,
        streamurl: camera.streamurl,
        status: camera.status,
      },
    });
    console.log(`Seeded ${camera.name}`);
  }

  console.log("Seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
