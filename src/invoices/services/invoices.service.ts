import { Injectable, NotFoundException } from '@nestjs/common';
import { InvoicesRepository } from '../repositories/invoices.repository';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { UpdateInvoiceDto } from '../dto/update-invoice.dto';
import { UpdateInvoiceStatusDto } from '../dto/update-invoice-status.dto';
import { QueryInvoiceDto } from '../dto/query-invoice.dto';
import { AuditService } from '../../audit/services/audit.service';
import { AuditAction, InvoiceStatus, Prisma } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class InvoicesService {
  constructor(
    private readonly invoicesRepository: InvoicesRepository,
    private readonly auditService: AuditService,
  ) {}

  private calculateTotals(items: any[]) {
    const subtotal = items.reduce(
      (sum, item) => sum + Number(item.quantity) * Number(item.unitPrice),
      0,
    );
    const taxAmount = subtotal * 0.11;
    const totalAmount = subtotal + taxAmount;
    return { subtotal, taxAmount, totalAmount };
  }

  private generateHash(data: any) {
    const str = `${data.invoiceNumber}-${data.customerId}-${Number(data.subtotal)}-${Number(data.taxAmount)}-${Number(data.totalAmount)}-${data.issueDate}-${data.dueDate}-${data.status}`;
    return crypto.createHash('sha256').update(str).digest('hex');
  }

  private async generateInvoiceNumber() {
    const today = new Date();
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);
    const end = new Date(today);
    end.setHours(23, 59, 59, 999);

    const count = await this.invoicesRepository.countToday(start, end);
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}${mm}${dd}`;
    const sequence = String(count + 1).padStart(6, '0');
    return `INV-${dateStr}-${sequence}`;
  }

  async findAll(query: QueryInvoiceDto) {
    return this.invoicesRepository.findAll(query);
  }

  async findOne(id: string) {
    const invoice = await this.invoicesRepository.findById(id);
    if (!invoice) throw new NotFoundException(`Invoice ${id} not found`);
    return invoice;
  }

  async create(createInvoiceDto: CreateInvoiceDto, userId: string) {
    const invoiceNumber = await this.generateInvoiceNumber();

    const items = createInvoiceDto.items.map((i) => ({
      ...i,
      totalPrice: Number(i.quantity) * Number(i.unitPrice),
    }));

    const { subtotal, taxAmount, totalAmount } = this.calculateTotals(items);

    const hashData = {
      invoiceNumber,
      customerId: createInvoiceDto.customerId,
      subtotal,
      taxAmount,
      totalAmount,
      issueDate: new Date(createInvoiceDto.issueDate).toISOString(),
      dueDate: createInvoiceDto.dueDate
        ? new Date(createInvoiceDto.dueDate).toISOString()
        : null,
      status: InvoiceStatus.DRAFT,
    };

    const integrityHash = this.generateHash(hashData);

    const createData: Prisma.InvoiceCreateInput = {
      invoiceNumber,
      issueDate: new Date(createInvoiceDto.issueDate),
      dueDate: createInvoiceDto.dueDate
        ? new Date(createInvoiceDto.dueDate)
        : null,
      subtotal,
      taxAmount,
      totalAmount,
      integrityHash,
      status: InvoiceStatus.DRAFT,
      customer: { connect: { id: createInvoiceDto.customerId } },
      createdBy: { connect: { id: userId } },
      items: { create: items },
    };

    const invoice = await this.invoicesRepository.create(createData);

    await this.auditService.log({
      userId,
      entityType: 'Invoice',
      entityId: invoice.id,
      action: AuditAction.CREATE,
      newValue: invoice,
    });

    return invoice;
  }

  async update(id: string, updateInvoiceDto: UpdateInvoiceDto, userId: string) {
    const existing = await this.findOne(id);

    const customerId = updateInvoiceDto.customerId || existing.customerId;
    const issueDate =
      updateInvoiceDto.issueDate || existing.issueDate.toISOString();
    const dueDate =
      updateInvoiceDto.dueDate !== undefined
        ? updateInvoiceDto.dueDate
        : existing.dueDate?.toISOString();

    let itemsToProcess = existing.items;
    let itemsCreateInput:
      | Prisma.InvoiceItemUpdateManyWithoutInvoiceNestedInput
      | undefined = undefined;

    if (updateInvoiceDto.items) {
      itemsToProcess = updateInvoiceDto.items.map((i) => ({
        ...i,
        totalPrice: Number(i.quantity) * Number(i.unitPrice),
      })) as any;
      itemsCreateInput = {
        deleteMany: {},
        create: itemsToProcess,
      };
    }

    const { subtotal, taxAmount, totalAmount } =
      this.calculateTotals(itemsToProcess);

    const hashData = {
      invoiceNumber: existing.invoiceNumber,
      customerId,
      subtotal,
      taxAmount,
      totalAmount,
      issueDate: new Date(issueDate).toISOString(),
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      status: existing.status,
    };

    const integrityHash = this.generateHash(hashData);

    const updateData: Prisma.InvoiceUpdateInput = {
      issueDate: new Date(issueDate),
      dueDate: dueDate ? new Date(dueDate) : null,
      subtotal,
      taxAmount,
      totalAmount,
      integrityHash,
      updatedBy: { connect: { id: userId } },
    };

    if (updateInvoiceDto.customerId) {
      updateData.customer = { connect: { id: customerId } };
    }
    if (itemsCreateInput) {
      updateData.items = itemsCreateInput;
    }

    const updated = await this.invoicesRepository.update(id, updateData);

    await this.auditService.log({
      userId,
      entityType: 'Invoice',
      entityId: id,
      action: AuditAction.UPDATE,
      oldValue: existing,
      newValue: updated,
    });

    return updated;
  }

  async updateStatus(
    id: string,
    updateStatusDto: UpdateInvoiceStatusDto,
    userId: string,
  ) {
    const existing = await this.findOne(id);

    const hashData = {
      invoiceNumber: existing.invoiceNumber,
      customerId: existing.customerId,
      subtotal: existing.subtotal,
      taxAmount: existing.taxAmount,
      totalAmount: existing.totalAmount,
      issueDate: existing.issueDate.toISOString(),
      dueDate: existing.dueDate ? existing.dueDate.toISOString() : null,
      status: updateStatusDto.status,
    };

    const integrityHash = this.generateHash(hashData);

    const updated = await this.invoicesRepository.update(id, {
      status: updateStatusDto.status,
      integrityHash,
      updatedBy: { connect: { id: userId } },
    });

    await this.auditService.log({
      userId,
      entityType: 'Invoice',
      entityId: id,
      action: AuditAction.STATUS_CHANGE,
      oldValue: { status: existing.status },
      newValue: { status: updated.status },
    });

    return updated;
  }

  async remove(id: string, userId: string) {
    const existing = await this.findOne(id);

    await this.invoicesRepository.softDelete(id);

    await this.auditService.log({
      userId,
      entityType: 'Invoice',
      entityId: id,
      action: AuditAction.DELETE,
      oldValue: existing,
    });

    return { message: 'Invoice successfully deleted' };
  }
}
