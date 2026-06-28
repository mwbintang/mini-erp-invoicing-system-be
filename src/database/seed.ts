import { PrismaClient } from '@prisma/client';
import { seedRoles } from './seeders/role.seeder';
import { seedPermissions } from './seeders/permission.seeder';
import { seedRolePermissions } from './seeders/role-permission.seeder';
import { seedUsers } from './seeders/user.seeder';

const prisma = new PrismaClient();

async function main() {
  await seedRoles(prisma);
  await seedPermissions(prisma);
  await seedRolePermissions(prisma);
  await seedUsers(prisma);
}

main()
  .then(() => {
    console.log('Seed completed');
  })
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });