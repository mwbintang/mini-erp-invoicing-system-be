import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QueryInvoiceDto } from '../dto/query-invoice.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class InvoicesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryInvoiceDto) {
    const {
      search,
      status,
      customerId,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.InvoiceWhereInput = { deletedAt: null };

    if (search) {
      where.invoiceNumber = { contains: search, mode: 'insensitive' };
    }
    if (status) {
      where.status = status;
    }
    if (customerId) {
      where.customerId = customerId;
    }

    const orderBy: Prisma.InvoiceOrderByWithRelationInput = {
      [sortBy]: order,
    };

    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          customer: true,
        },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    return this.prisma.invoice.findFirst({
      where: { id, deletedAt: null },
      include: {
        customer: true,
        items: true,
        createdBy: { select: { id: true, name: true, email: true } },
        updatedBy: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async countToday(dateStart: Date, dateEnd: Date) {
    return this.prisma.invoice.count({
      where: {
        createdAt: {
          gte: dateStart,
          lt: dateEnd,
        },
      },
    });
  }

  async create(data: Prisma.InvoiceCreateInput) {
    return this.prisma.invoice.create({
      data,
      include: {
        items: true,
      },
    });
  }

  async update(id: string, data: Prisma.InvoiceUpdateInput) {
    return this.prisma.invoice.update({
      where: { id },
      data,
      include: {
        items: true,
      },
    });
  }

  async deleteItemsByInvoiceId(invoiceId: string) {
    return this.prisma.invoiceItem.deleteMany({
      where: { invoiceId },
    });
  }

  async softDelete(id: string) {
    return this.prisma.invoice.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
