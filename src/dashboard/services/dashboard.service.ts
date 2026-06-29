import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const [
      totalCustomers,
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      overdueInvoices,
      revenueResult,
    ] = await Promise.all([
      this.prisma.customer.count(),
      this.prisma.invoice.count(),
      this.prisma.invoice.count({ where: { status: 'PAID' } }),
      this.prisma.invoice.count({ where: { status: 'SENT' } }),
      this.prisma.invoice.count({ where: { status: 'OVERDUE' } }),
      this.prisma.invoice.aggregate({
        _sum: { totalAmount: true },
        where: { status: 'PAID' },
      }),
    ]);

    return {
      totalCustomers,
      totalInvoices,
      totalRevenue: revenueResult._sum.totalAmount
        ? Number(revenueResult._sum.totalAmount)
        : 0,
      paidInvoices,
      pendingInvoices,
      overdueInvoices,
    };
  }
}
