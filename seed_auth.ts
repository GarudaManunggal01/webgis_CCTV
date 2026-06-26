import "dotenv/config";

async function main() {
  const { prisma } = await import('./lib/prisma');
  const { hashPassword } = await import('./lib/auth');

  console.log('Seeding admin user...');

  const hashedPassword = await hashPassword('admin 123');

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: { password: hashedPassword },
    create: {
      username: 'admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('Admin user seeded successfully.');
}

main()
  .catch(console.error)
  .finally(async () => {
    const { prisma } = await import('./lib/prisma');
    await prisma.$disconnect();
  });
