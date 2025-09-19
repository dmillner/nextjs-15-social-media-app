// Seed script to create athlete users for testing integration

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding athlete users...');

  // Create some test athlete users
  const athletes = [
    {
      id: 'djlagway',
      username: 'djlagway',
      displayName: 'DJ Lagway',
      bio: 'Florida Gators QB #2 | NIL Profile | 🐊',
    },
    {
      id: 'zaneadams',
      username: 'zaneadams',
      displayName: 'Zane Adams',
      bio: 'College athlete | Building my brand',
    },
    {
      id: 'bobbyalcock',
      username: 'bobbyalcock',
      displayName: 'Bobby Alcock',
      bio: 'Student athlete | Follow my journey',
    },
  ];

  for (const athlete of athletes) {
    const user = await prisma.user.upsert({
      where: { username: athlete.username },
      update: {},
      create: {
        id: athlete.id,
        username: athlete.username,
        displayName: athlete.displayName,
        bio: athlete.bio,
      },
    });

    console.log(`✅ Created/updated user: ${user.displayName} (@${user.username})`);

    // Create a sample post for each athlete
    await prisma.post.create({
      data: {
        content: `Welcome to my NIL page! Excited to share my journey with you all. #${athlete.username} #NIL #college`,
        userId: user.id,
      },
    });

    console.log(`📝 Created sample post for ${user.displayName}`);
  }

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });