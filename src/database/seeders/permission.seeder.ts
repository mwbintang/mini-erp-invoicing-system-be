import { PrismaClient } from '@prisma/client';

export async function seedPermissions(
  prisma: PrismaClient,
) {
  const permissions = [
    { name: 'CUSTOMER_CREATE', module: 'CUSTOMER' },
    { name: 'CUSTOMER_READ', module: 'CUSTOMER' },
    { name: 'CUSTOMER_UPDATE', module: 'CUSTOMER' },
    { name: 'CUSTOMER_DELETE', module: 'CUSTOMER' },

    { name: 'INVOICE_CREATE', module: 'INVOICE' },
    { name: 'INVOICE_READ', module: 'INVOICE' },
    { name: 'INVOICE_UPDATE', module: 'INVOICE' },
    { name: 'INVOICE_DELETE', module: 'INVOICE' },
    { name: 'INVOICE_UPDATE_STATUS', module: 'INVOICE' },

    { name: 'DASHBOARD_READ', module: 'DASHBOARD' },

    { name: 'USER_READ', module: 'USER' },
    { name: 'USER_CREATE', module: 'USER' },
    { name: 'USER_UPDATE', module: 'USER' },
    { name: 'USER_DELETE', module: 'USER' },
  ];

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: {
        name: permission.name,
      },
      update: {},
      create: permission,
    });
  }
}