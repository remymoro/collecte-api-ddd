import 'dotenv/config';
import * as bcrypt from 'bcrypt';

import { PrismaClient, $Enums } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...\n');

  const username = process.env.SEED_ADMIN_USERNAME;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!username || !password) {
    throw new Error(
      '❌ SEED_ADMIN_USERNAME or SEED_ADMIN_PASSWORD missing in .env',
    );
  }

  // 1️⃣ Chercher le centre (par name ou code)
 let center = await prisma.center.findFirst({
  where: { name: 'Centre Principal' },
});

if (!center) {
  center = await prisma.center.create({
    data: {
      name: 'Centre Principal',
      address: 'Adresse par défaut', // ✅ OBLIGATOIRE
      city: 'Paris',
      postalCode: '75000',
    },
  });
}

  // 3️⃣ Hash du mot de passe
  const passwordHash = await bcrypt.hash(password, 10);

  // 4️⃣ Créer ou mettre à jour l'admin
  const admin = await prisma.user.upsert({
    where: { username },
    create: {
      username,
      passwordHash,
      role: $Enums.UserRole.ADMIN,
      activeCenterId: center.id,
    },
    update: {
      passwordHash,
      role: $Enums.UserRole.ADMIN,
      activeCenterId: center.id,
    },
  });

  console.log(`✅ Admin créé/mis à jour: ${admin.username} (${admin.role})`);
  console.log(`🏢 Lié au centre: ${center.name} (ID: ${center.id})\n`);
  console.log('🎉 Seed terminé avec succès !');
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });