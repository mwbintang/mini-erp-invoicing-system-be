import { Injectable, NotFoundException } from '@nestjs/common';
import { CustomersRepository } from '../repositories/customers.repository';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { QueryCustomerDto } from '../dto/query-customer.dto';
import { AuditService } from '../../audit/services/audit.service';
import { AuditAction } from '@prisma/client';

@Injectable()
export class CustomersService {
  constructor(
    private readonly customersRepository: CustomersRepository,
    private readonly auditService: AuditService,
  ) {}

  async findAll(query: QueryCustomerDto) {
    return this.customersRepository.findAll(query);
  }

  async findOne(id: string) {
    const customer = await this.customersRepository.findById(id);
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return customer;
  }

  async create(createCustomerDto: CreateCustomerDto, userId: string) {
    const customer = await this.customersRepository.create(createCustomerDto);

    await this.auditService.log({
      userId,
      entityType: 'Customer',
      entityId: customer.id,
      action: AuditAction.CREATE,
      newValue: customer,
    });

    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto, userId: string) {
    const existingCustomer = await this.findOne(id);

    const updatedCustomer = await this.customersRepository.update(id, updateCustomerDto);

    await this.auditService.log({
      userId,
      entityType: 'Customer',
      entityId: updatedCustomer.id,
      action: AuditAction.UPDATE,
      oldValue: existingCustomer,
      newValue: updatedCustomer,
    });

    return updatedCustomer;
  }

  async remove(id: string, userId: string) {
    const existingCustomer = await this.findOne(id);

    await this.customersRepository.remove(id);

    await this.auditService.log({
      userId,
      entityType: 'Customer',
      entityId: id,
      action: AuditAction.DELETE,
      oldValue: existingCustomer,
    });

    return { message: 'Customer successfully deleted' };
  }
}
