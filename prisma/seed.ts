import { hashPassword } from 'better-auth/crypto';
import { assertLocalDatabase } from '../scripts/assert-local-db';
import { createPrismaClient } from '../src/lib/prisma-client';

const SEED_PASSWORD = 'artnote-dev-password';

// One account per kind of user QA needs. Staging has the same accounts with other passwords
// (AGENTS.md, Environments and QA).
const seedUsers = [
  { id: 'seed-user-admin', email: 'admin@example.com', name: 'Admin ArtNote', role: 'admin' },
  // A second writer: the seed notices belong to the first, so this one sees none of them (ADR 0003)
  {
    id: 'seed-user-writer',
    email: 'writer@example.com',
    name: 'Rédactrice ArtNote',
    role: 'admin',
  },
  { id: 'seed-user-reader', email: 'user@example.com', name: 'Lecteur ArtNote', role: 'user' },
  {
    id: 'seed-user-banned',
    email: 'banned@example.com',
    name: 'Compte suspendu',
    role: 'user',
    banned: true,
    banReason: 'Compte de test suspendu',
  },
] as const;

const prisma = createPrismaClient(assertLocalDatabase(process.env.PRISMA_DATABASE_URL));

async function seedAccounts() {
  const password = await hashPassword(SEED_PASSWORD);
  const now = new Date();
  for (const user of seedUsers) {
    const { id: _id, email: _email, ...fields } = user;
    await prisma.user.upsert({
      where: { email: user.email },
      // Re-seeding restores each account's role and ban, whatever QA changed
      update: fields,
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

  const places = [
    {
      id: 'seed-place-fine-arts',
      name: 'Musées royaux des Beaux-Arts de Belgique',
      type: 'MUSEUM',
      city: 'Bruxelles',
      country: 'Belgique',
      website: 'https://fine-arts-museum.be',
    },
    {
      id: 'seed-place-saint-bavo',
      name: 'Cathédrale Saint-Bavon',
      type: 'CHURCH',
      city: 'Gand',
      country: 'Belgique',
    },
  ];
  for (const place of places) {
    await prisma.place.upsert({
      where: { id: place.id },
      update: place,
      create: { ...place, ...audit },
    });
  }

  const artists = [
    {
      id: 'seed-artist-bruegel',
      firstName: 'Pieter',
      lastName: 'Bruegel l’Ancien',
      birthDate: new Date('1525-01-01'),
      deathDate: new Date('1569-09-09'),
      biography: '<p>Peintre flamand de la Renaissance, maître des scènes paysannes.</p>',
    },
    {
      id: 'seed-artist-van-eyck',
      firstName: 'Jan',
      lastName: 'van Eyck',
      birthDate: new Date('1390-01-01'),
      deathDate: new Date('1441-07-09'),
      biography: '<p>Peintre primitif flamand, figure majeure de la peinture à l’huile.</p>',
    },
    {
      id: 'seed-artist-magritte',
      firstName: 'René',
      lastName: 'Magritte',
      birthDate: new Date('1898-11-21'),
      deathDate: new Date('1967-08-15'),
      biography: '<p>Peintre surréaliste belge.</p>',
    },
  ];
  for (const artist of artists) {
    await prisma.artist.upsert({
      where: { id: artist.id },
      update: artist,
      create: { ...artist, ...audit },
    });
  }

  const artworks = [
    {
      id: 'seed-artwork-icarus',
      title: 'Paysage avec la chute d’Icare',
      creationYear: 'vers 1560',
      medium: 'Huile sur toile',
      dimensions: '73,5 × 112 cm',
      status: 'PUBLISHED',
      publishedAt: new Date('2026-01-15'),
      placeId: 'seed-place-fine-arts',
      artistId: 'seed-artist-bruegel',
      notice:
        '<p>Au premier plan, un laboureur poursuit son travail. Icare, lui, disparaît presque dans un coin de la mer.</p>',
    },
    {
      id: 'seed-artwork-lamb',
      title: 'L’Adoration de l’Agneau mystique',
      creationYear: '1432',
      medium: 'Huile sur panneau',
      dimensions: '350 × 461 cm',
      status: 'PUBLISHED',
      publishedAt: new Date('2026-02-01'),
      placeId: 'seed-place-saint-bavo',
      artistId: 'seed-artist-van-eyck',
      notice:
        '<p>Le polyptyque ouvert présente l’Agneau sur un autel, entouré de groupes de fidèles.</p>',
    },
    {
      id: 'seed-artwork-empire',
      title: 'L’Empire des lumières',
      creationYear: '1954',
      medium: 'Huile sur toile',
      dimensions: '146 × 114 cm',
      status: 'DRAFT',
      publishedAt: null,
      placeId: 'seed-place-fine-arts',
      artistId: 'seed-artist-magritte',
      notice: '<p>Brouillon : une rue nocturne sous un ciel de plein jour.</p>',
    },
  ];
  for (const { artistId, ...artwork } of artworks) {
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
  await seedCatalogue(seedUsers[0].id);
  console.log('Seeded local database. Sign in with:');
  for (const user of seedUsers)
    console.log(
      `  ${user.role.padEnd(5)}  ${user.email} / ${SEED_PASSWORD}${'banned' in user ? ' (banned)' : ''}`,
    );
}

await main().finally(() => prisma.$disconnect());
