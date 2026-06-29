import { PrismaClient } from '@prisma/client';

export async function seedRoles(prisma: PrismaClient) {
  const roles = ['ADMIN', 'SALES', 'FINANCE'];

  for (const role of roles) {
    await prisma.role.upsert({
      where: {
        name: role,
      },
      update: {},
      create: {
        name: role,
      },
    });
  }
}
