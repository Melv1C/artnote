// What the seed writes (prisma/seed.ts) and the end-to-end tests read back (e2e/fixtures.ts).
// Plain data and type imports only: Playwright loads it outside the app.
import type { ArtworkStatus, PlaceType, UserRole } from '../src/schemas/common';

export const SEED_PASSWORD = 'artnote-dev-password';

// One account per kind of user QA needs. Staging has the same accounts with other passwords
// (AGENTS.md, Environments and QA).
export const seedUsers = {
  admin: {
    id: 'seed-user-admin',
    email: 'admin@example.com',
    name: 'Admin ArtNote',
    role: 'admin',
  },
  // A second writer: the seed notices belong to the first, so this one sees none of them (ADR 0003)
  writer: {
    id: 'seed-user-writer',
    email: 'writer@example.com',
    name: 'Rédactrice ArtNote',
    role: 'admin',
  },
  user: {
    id: 'seed-user-reader',
    email: 'user@example.com',
    name: 'Lecteur ArtNote',
    role: 'user',
  },
  banned: {
    id: 'seed-user-banned',
    email: 'banned@example.com',
    name: 'Compte suspendu',
    role: 'user',
    banned: true,
    banReason: 'Compte de test suspendu',
  },
} as const satisfies Record<string, { role: UserRole; [field: string]: unknown }>;

export const seedPlaces = {
  fineArts: {
    id: 'seed-place-fine-arts',
    name: 'Musées royaux des Beaux-Arts de Belgique',
    type: 'MUSEUM',
    city: 'Bruxelles',
    country: 'Belgique',
    website: 'https://fine-arts-museum.be',
    latitude: 50.8417,
    longitude: 4.3579,
  },
  saintBavo: {
    id: 'seed-place-saint-bavo',
    name: 'Cathédrale Saint-Bavon',
    type: 'CHURCH',
    city: 'Gand',
    country: 'Belgique',
    latitude: 51.0531,
    longitude: 3.7272,
  },
  // Its only notice is a draft: the public map leaves it out
  magritte: {
    id: 'seed-place-magritte',
    name: 'Musée Magritte Museum',
    type: 'MUSEUM',
    city: 'Bruxelles',
    country: 'Belgique',
    latitude: 50.8428,
    longitude: 4.3586,
  },
  // No position yet, as places written before positions were required
  groeninge: {
    id: 'seed-place-groeninge',
    name: 'Musée Groeninge',
    type: 'MUSEUM',
    city: 'Bruges',
    country: 'Belgique',
  },
} satisfies Record<string, { type: PlaceType; [field: string]: unknown }>;

export const seedArtists = {
  bruegel: {
    id: 'seed-artist-bruegel',
    firstName: 'Pieter',
    lastName: 'Bruegel l’Ancien',
    birthDate: 'vers 1525',
    deathDate: '09/09/1569',
    biography: '<p>Peintre flamand de la Renaissance, maître des scènes paysannes.</p>',
  },
  vanEyck: {
    id: 'seed-artist-van-eyck',
    firstName: 'Jan',
    lastName: 'van Eyck',
    birthDate: 'vers 1390',
    deathDate: '09/07/1441',
    biography: '<p>Peintre primitif flamand, figure majeure de la peinture à l’huile.</p>',
  },
  magritte: {
    id: 'seed-artist-magritte',
    firstName: 'René',
    lastName: 'Magritte',
    birthDate: '21/11/1898',
    deathDate: '15/08/1967',
    biography: '<p>Peintre surréaliste belge.</p>',
  },
};

// All written by the admin account
export const seedNotices = {
  icarus: {
    id: 'seed-artwork-icarus',
    title: 'Paysage avec la chute d’Icare',
    creationYear: 'vers 1560',
    medium: 'Huile sur toile',
    dimensions: '73,5 × 112 cm',
    status: 'PUBLISHED',
    publishedAt: new Date('2026-01-15'),
    placeId: seedPlaces.fineArts.id,
    artistId: seedArtists.bruegel.id,
    notice:
      '<p>Au premier plan, un laboureur poursuit son travail. Icare, lui, disparaît presque dans un coin de la mer.</p>',
  },
  census: {
    id: 'seed-artwork-census',
    title: 'Le Dénombrement de Bethléem',
    creationYear: '1566',
    medium: 'Huile sur panneau',
    dimensions: '115,5 × 164,5 cm',
    status: 'PUBLISHED',
    publishedAt: new Date('2026-01-20'),
    placeId: seedPlaces.fineArts.id,
    artistId: seedArtists.bruegel.id,
    notice:
      '<p>Sous la neige, un village flamand se presse devant l’auberge où l’on se fait recenser ; Marie et Joseph passent presque inaperçus.</p>',
  },
  lamb: {
    id: 'seed-artwork-lamb',
    title: 'L’Adoration de l’Agneau mystique',
    creationYear: '1432',
    medium: 'Huile sur panneau',
    dimensions: '350 × 461 cm',
    status: 'PUBLISHED',
    publishedAt: new Date('2026-02-01'),
    placeId: seedPlaces.saintBavo.id,
    artistId: seedArtists.vanEyck.id,
    notice:
      '<p>Le polyptyque ouvert présente l’Agneau sur un autel, entouré de groupes de fidèles.</p>',
  },
  empire: {
    id: 'seed-artwork-empire',
    title: 'L’Empire des lumières',
    creationYear: '1954',
    medium: 'Huile sur toile',
    dimensions: '146 × 114 cm',
    status: 'DRAFT',
    publishedAt: null,
    placeId: seedPlaces.magritte.id,
    artistId: seedArtists.magritte.id,
    notice: '<p>Brouillon : une rue nocturne sous un ciel de plein jour.</p>',
  },
} satisfies Record<string, { status: ArtworkStatus; [field: string]: unknown }>;
