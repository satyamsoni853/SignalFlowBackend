import 'dotenv/config';
import { createHash } from 'crypto';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Condition, AlertStatus } from '../src/generated/prisma';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

async function main() {
  console.log('Seeding database...');

  // Clean up existing seed data
  await prisma.alertLog.deleteMany();
  await prisma.alertRule.deleteMany();
  await prisma.user.deleteMany({ where: { email: 'test@signalflow.dev' } });

  // Create test user
  const user = await prisma.user.create({
    data: {
      email: 'test@signalflow.dev',
      password_hash: hashPassword('password123'),
    },
  });
  console.log(`Created user: ${user.email} (id: ${user.id})`);

  // Create sample alert rules
  const rules = await prisma.alertRule.createMany({
    data: [
      {
        user_id: user.id,
        asset_symbol: 'BTC',
        condition: Condition.GREATER_THAN,
        target_price: 70000,
        status: AlertStatus.active,
      },
      {
        user_id: user.id,
        asset_symbol: 'ETH',
        condition: Condition.LESS_THAN,
        target_price: 2000,
        status: AlertStatus.active,
      },
      {
        user_id: user.id,
        asset_symbol: 'SOL',
        condition: Condition.GREATER_THAN,
        target_price: 200,
        status: AlertStatus.triggered,
      },
    ],
  });
  console.log(`Created ${rules.count} alert rules`);

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
