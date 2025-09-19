/**
 * Create social media profiles for ALL athletes from Spengine database
 * Profiles are initially unclaimed until athlete verifies with .edu email
 */

const { PrismaClient } = require('@prisma/client');
const Database = require('better-sqlite3');
const path = require('path');

const prisma = new PrismaClient();

// Connect to Spengine database
const spengineDbPath = path.join(__dirname, '../../spengine/lib/search/spengine.db');
const spengineDb = new Database(spengineDbPath, { readonly: true });

function generateUsername(fullName, athleteId) {
  // Create username from athlete ID (already formatted nicely)
  let username = athleteId.replace(/-/g, '').toLowerCase();

  // Ensure it's not too long
  if (username.length > 20) {
    username = username.substring(0, 20);
  }

  return username;
}

function createBio(athlete) {
  const parts = [];

  if (athlete.position) parts.push(athlete.position);
  if (athlete.classification) parts.push(athlete.classification);
  if (athlete.jersey_number) parts.push(`#${athlete.jersey_number}`);
  parts.push(`${athlete.school_name}`);

  let bio = parts.join(' | ');

  // Add NIL branding
  bio += ' | NIL Profile 🏆';

  // Truncate if too long
  if (bio.length > 160) {
    bio = bio.substring(0, 157) + '...';
  }

  return bio;
}

async function main() {
  console.log('🏈 Creating social media profiles for ALL athletes...\n');

  try {
    // Get all athletes from Spengine database
    const athletes = spengineDb.prepare(`
      SELECT
        id, full_name, school_name, bio, position,
        classification, jersey_number, height, weight
      FROM athletes
      ORDER BY school_name, full_name
    `).all();

    console.log(`📊 Found ${athletes.length} athletes in Spengine database`);

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const athlete of athletes) {
      try {
        const username = generateUsername(athlete.full_name, athlete.id);
        const bio = createBio(athlete);

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { username: username }
        });

        if (existingUser) {
          skipped++;
          continue;
        }

        // Create unclaimed social media profile
        await prisma.user.create({
          data: {
            id: athlete.id, // Use Spengine athlete ID
            username: username,
            displayName: athlete.full_name,
            bio: bio,
          }
        });

        created++;

        if (created % 100 === 0) {
          console.log(`✅ Created ${created} profiles...`);
        }

      } catch (error) {
        errors++;
        if (error.code === 'P2002') {
          // Unique constraint violation - skip
          skipped++;
        } else {
          console.error(`❌ Error creating profile for ${athlete.full_name}:`, error.message);
        }
      }
    }

    console.log('\n🎉 Bulk profile creation complete!');
    console.log(`📈 Results:`);
    console.log(`   ✅ Created: ${created} new profiles`);
    console.log(`   ⏭️  Skipped: ${skipped} existing profiles`);
    console.log(`   ❌ Errors: ${errors} failed creations`);

    // Create a welcome post for new users
    if (created > 0) {
      console.log('\n📝 Creating welcome posts...');

      const newUsers = await prisma.user.findMany({
        where: {
          posts: {
            none: {}
          }
        },
        take: Math.min(created, 100) // Limit to avoid overwhelming the database
      });

      for (const user of newUsers) {
        await prisma.post.create({
          data: {
            content: `🏆 Welcome to my NIL page! This is ${user.displayName}'s official social media presence. Stay tuned for updates on my athletic journey! #NIL #${user.username}`,
            userId: user.id
          }
        });
      }

      console.log(`📝 Created welcome posts for ${newUsers.length} athletes`);
    }

  } catch (error) {
    console.error('❌ Bulk creation failed:', error);
  } finally {
    spengineDb.close();
  }
}

main()
  .catch((e) => {
    console.error('❌ Script failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });