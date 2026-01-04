import 'dotenv/config';
import * as bcrypt from 'bcrypt';

import { PrismaClient, $Enums } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Créer un centre
  const centerId = 'b50e4a52-6319-4555-86a8-e14b1216544a';
  const center = await prisma.center.upsert({
    where: { id: centerId },
    create: {
      id: centerId,
      name: 'Centre Montauban',
      address: '10 Rue des Carmes',
      city: 'Montauban',
      postalCode: '82000',
    },
    update: {
      name: 'Centre Montauban',
      address: '10 Rue des Carmes',
      city: 'Montauban',
      postalCode: '82000',
    },
  });
  console.log('✅ Centre créé:', center.name);

  // 2. Créer un admin (sans centre)
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    create: {
      username: 'admin',
      passwordHash: adminPassword,
      role: 'ADMIN',
      centerId: null, // ⭐ Pas de centre pour ADMIN
    },
    update: {
      passwordHash: adminPassword,
      role: 'ADMIN',
      centerId: null,
    },
  });
  console.log('✅ Admin créé:', admin.username);

  // 3. Créer un bénévole (avec centre)
  const benevolePassword = await bcrypt.hash('benevole123', 10);
  const benevole = await prisma.user.upsert({
    where: { username: 'benevole@collecte.fr' },
    create: {
      username: 'benevole@collecte.fr',
      passwordHash: benevolePassword,
      role: 'BENEVOLE',
      centerId: center.id, // ⭐ Avec centre
    },
    update: {
      passwordHash: benevolePassword,
      role: 'BENEVOLE',
      centerId: center.id,
    },
  });
  console.log('✅ Bénévole créé:', benevole.username);

  // 4. Créer des produits
  const products = [
    { reference: 'CONSERVE001', family: 'Conserves', subFamily: 'Légumes' },
    { reference: 'PATES001', family: 'Épicerie', subFamily: 'Pâtes' },
    { reference: 'RIZ001', family: 'Épicerie', subFamily: 'Riz' },
    { reference: 'LAIT001', family: 'Frais', subFamily: 'Produits laitiers' },
    { reference: 'HUILE001', family: 'Épicerie', subFamily: 'Huiles' },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { reference: product.reference },
      create: product,
      update: {
        family: product.family,
        subFamily: product.subFamily,
        isActive: true,
      },
    });
  }
  console.log('✅ Produits créés:', products.length);

  console.log('🎉 Seeding terminé !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });