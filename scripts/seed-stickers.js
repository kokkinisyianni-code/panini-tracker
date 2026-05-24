#!/usr/bin/env node
/**
 * Seed script: Populates Firestore with sticker data
 * Usage: npx ts-node scripts/seed-stickers.ts
 * 
 * Requirements:
 * - Set FIREBASE_SERVICE_ACCOUNT_KEY env var to your service account JSON path
 * - Or place service-account.json in project root
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');

// Load service account
let serviceAccount;
try {
  serviceAccount = require('../service-account.json');
} catch {
  console.error('❌ service-account.json not found. Download it from Firebase Console > Project Settings > Service Accounts');
  process.exit(1);
}

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// Re-use the sticker data logic inline
const teams = [
  'USA', 'Canada', 'Mexico', 'Argentina', 'Chile', 'Peru',
  'Brazil', 'Colombia', 'Venezuela', 'France', 'Belgium', 'Morocco',
  'England', 'Portugal', 'Algeria', 'Spain', 'Germany', 'Netherlands',
  'Italy', 'Croatia', 'Ecuador', 'Uruguay', 'Paraguay', 'Bolivia',
  'Japan', 'South Korea', 'Australia', 'Senegal', 'Nigeria', 'Ivory Coast',
  'Egypt', 'Tunisia', 'South Africa', 'Iran', 'Saudi Arabia', 'Qatar',
  'Poland', 'Czech Republic', 'Slovakia', 'Serbia', 'Switzerland', 'Romania',
  'Honduras', 'Costa Rica', 'New Zealand', 'Panama', 'Cuba',
];

const uniqueTeams = [...new Set(teams)];

function generateStickers() {
  const stickers = [];
  let number = 1;

  // Cover stickers
  for (let i = 0; i < 10; i++) {
    stickers.push({
      id: `sticker_${number}`,
      number,
      name: `World Cup 2026 Cover ${i + 1}`,
      team: 'FIFA',
      category: 'cover',
      section: 'Introduction',
    });
    number++;
  }

  // Special stickers
  const specials = ['Trophy', 'Host Cities', 'USA Flag', 'Canada Flag', 'Mexico Flag', 
    'FIFA Logo', 'World Cup History', 'Group Stage', 'Knockout Stage', 'Final Stadium'];
  for (const name of specials) {
    stickers.push({ id: `sticker_${number}`, number, name, team: 'FIFA', category: 'special', section: 'Special' });
    number++;
  }

  // Team stickers
  for (const team of uniqueTeams) {
    stickers.push({ id: `sticker_${number}`, number, name: `${team} Badge`, team, category: 'team_badge', section: team });
    number++;
    stickers.push({ id: `sticker_${number}`, number, name: `${team} Squad`, team, category: 'group', section: team });
    number++;
    for (let p = 1; p <= 11; p++) {
      stickers.push({ id: `sticker_${number}`, number, name: `${team} Player ${p}`, team, category: 'player', section: team });
      number++;
    }
  }

  return stickers;
}

async function seed() {
  console.log('🌱 Starting seed...');
  const stickers = generateStickers();
  console.log(`📦 Seeding ${stickers.length} stickers...`);

  const BATCH_SIZE = 400;
  for (let i = 0; i < stickers.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const chunk = stickers.slice(i, i + BATCH_SIZE);
    for (const sticker of chunk) {
      batch.set(db.collection('stickers').doc(sticker.id), sticker);
    }
    await batch.commit();
    console.log(`✅ Committed ${Math.min(i + BATCH_SIZE, stickers.length)}/${stickers.length}`);
  }

  console.log('🎉 Seed complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
