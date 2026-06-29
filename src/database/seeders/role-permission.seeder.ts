import { PrismaClient } from '@prisma/client';

export async function seedRolePermissions(prisma: PrismaClient) {
  const adminRole = await prisma.role.findUnique({
    where: { name: 'ADMIN' },
  });

  const salesRole = await prisma.role.findUnique({
    where: { name: 'SALES' },
  });

  const financeRole = await prisma.role.findUnique({
    where: { name: 'FINANCE' },
  });

  const permissions = await prisma.permission.findMany();

  // ADMIN = ALL
  for (const permission of permissions) {
    if (!adminRole) {
      throw new Error('Admin role not found');
    }

    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  const salesPermissions = [
    'CUSTOMER_CREATE',
    'CUSTOMER_READ',
    'CUSTOMER_UPDATE',
    'INVOICE_CREATE',
    'INVOICE_READ',
    'INVOICE_UPDATE',
    'DASHBOARD_READ',
  ];

  const financePermissions = [
    'CUSTOMER_READ',
    'INVOICE_READ',
    'INVOICE_UPDATE_STATUS',
    'DASHBOARD_READ',
  ];

  for (const permissionName of salesPermissions) {
    const permission = permissions.find((p) => p.name === permissionName);

    if (!permission) {
      throw new Error(`Permission not found: ${permissionName}`);
    }

    if (!salesRole) {
      throw new Error('Sales role not found');
    }

    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: salesRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: salesRole.id,
        permissionId: permission.id,
      },
    });
  }

  for (const permissionName of financePermissions) {
    const permission = permissions.find((p) => p.name === permissionName);

    if (!permission) {
      throw new Error(`Permission not found: ${permissionName}`);
    }

    if (!financeRole) {
      throw new Error('Finance role not found');
    }

    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: financeRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: financeRole.id,
        permissionId: permission.id,
      },
    });
  }
}
