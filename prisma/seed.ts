import { hashPassword } from 'better-auth/crypto';
import { assertLocalDatabase } from '../scripts/assert-local-db';
import { createPrismaClient } from '../src/lib/prisma-client';
import { SEED_PASSWORD, seedArtists, seedNotices, seedPlaces, seedUsers } from './seed-data';

const prisma = createPrismaClient(assertLocalDatabase(process.env.PRISMA_DATABASE_URL));

async function seedAccounts() {
  const password = await hashPassword(SEED_PASSWORD);
  const now = new Date();
  for (const user of Object.values(seedUsers)) {
    const { id: _id, email: _email, ...fields } = user;
    await prisma.user.upsert({
      where: { email: user.email },
      // Re-seeding restores each account's role and ban, whatever QA changed
      update: { banned: false, banReason: null, banExpires: null, ...fields },
      create: { ...user, emailVerified: true, createdAt: now, updatedAt: now },
    });
    await prisma.account.upsert({
      where: { id: `${user.id}-credential` },
      update: { password },
      create: {
        id: `${user.id}-credential`,
        accountId: user.id,
        providerId: 'credential',
        userId: user.id,
        password,
        createdAt: now,
        updatedAt: now,
      },
    });
  }
}

async function seedCatalogue(adminId: string) {
  const audit = { createdById: adminId, updatedById: adminId };

  for (const place of Object.values(seedPlaces)) {
    await prisma.place.upsert({
      where: { id: place.id },
      update: place,
      create: { ...place, ...audit },
    });
  }

  for (const artist of Object.values(seedArtists)) {
    await prisma.artist.upsert({
      where: { id: artist.id },
      update: artist,
      create: { ...artist, ...audit },
    });
  }

  for (const { artistId, ...artwork } of Object.values(seedNotices)) {
    await prisma.artwork.upsert({
      where: { id: artwork.id },
      update: artwork,
      create: { ...artwork, writerId: adminId },
    });
    await prisma.artworkArtist.upsert({
      where: { artworkId_artistId: { artworkId: artwork.id, artistId } },
      update: {},
      create: { artworkId: artwork.id, artistId, role: 'peintre' },
    });
  }
}

async function main() {
  await seedAccounts();
  await seedCatalogue(seedUsers.admin.id);
  console.log('Seeded local database. Sign in with:');
  for (const user of Object.values(seedUsers))
    console.log(
      `  ${user.role.padEnd(5)}  ${user.email} / ${SEED_PASSWORD}${'banned' in user ? ' (banned)' : ''}`,
    );
}

await main().finally(() => prisma.$disconnect());
