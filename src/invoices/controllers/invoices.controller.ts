import {
  Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards,
} from '@nestjs/common';
import { InvoicesService } from '../services/invoices.service';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { UpdateInvoiceDto } from '../dto/update-invoice.dto';
import { UpdateInvoiceStatusDto } from '../dto/update-invoice-status.dto';
import { QueryInvoiceDto } from '../dto/query-invoice.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) { }

  @Post()
  @Permissions('INVOICE_CREATE')
  @ApiOperation({ summary: 'Create a new invoice' })
  create(@Body() createInvoiceDto: CreateInvoiceDto, @CurrentUser() user: any) {
    return this.invoicesService.create(createInvoiceDto, user?.id);
  }

  @Get()
  @Permissions('INVOICE_READ')
  @ApiOperation({ summary: 'Get all invoices' })
  findAll(@Query() query: QueryInvoiceDto) {
    return this.invoicesService.findAll(query);
  }

  @Get(':id')
  @Permissions('INVOICE_READ')
  @ApiOperation({ summary: 'Get an invoice by id' })
  findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(id);
  }

  @Patch(':id')
  @Permissions('INVOICE_UPDATE')
  @ApiOperation({ summary: 'Update an invoice' })
  update(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto, @CurrentUser() user: any) {
    return this.invoicesService.update(id, updateInvoiceDto, user?.id);
  }

  @Patch(':id/status')
  @Permissions('INVOICE_UPDATE_STATUS')
  @ApiOperation({ summary: 'Update an invoice status' })
  updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateInvoiceStatusDto, @CurrentUser() user: any) {
    return this.invoicesService.updateStatus(id, updateStatusDto, user?.id);
  }

  @Delete(':id')
  @Permissions('INVOICE_DELETE')
  @ApiOperation({ summary: 'Delete an invoice' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.invoicesService.remove(id, user?.id);
  }
}
