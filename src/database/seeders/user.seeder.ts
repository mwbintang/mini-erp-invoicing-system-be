import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

export async function seedUsers(prisma: PrismaClient) {
  const adminRole = await prisma.role.findUnique({
    where: {
      name: 'ADMIN',
    },
  });

  if (!adminRole) {
    throw new Error('Admin role not found');
  }

  const hashedPassword = await bcrypt.hash('Password123!', 10);

  await prisma.user.upsert({
    where: {
      email: 'admin@erp.com',
    },
    update: {},
    create: {
      email: 'admin@erp.com',
      password: hashedPassword,
      name: 'System Administrator',
      roleId: adminRole.id,
    },
  });
}
