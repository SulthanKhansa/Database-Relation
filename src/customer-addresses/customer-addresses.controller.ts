import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator.js';
import { UserRole } from '../users/entities/user.entity.js';
import { CustomerAddressesService } from './customer-addresses.service.js';
import { CreateCustomerAddressDto } from './dto/create-customer-address.dto.js';
import { QueryCustomerAddressDto } from './dto/query-customer-address.dto.js';
import { UpdateCustomerAddressDto } from './dto/update-customer-address.dto.js';

@ApiTags('Customer Addresses')
@ApiBearerAuth()
@Controller('customer-addresses')
export class CustomerAddressesController {
  constructor(
    private readonly customerAddressesService: CustomerAddressesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Daftar alamat customer' })
  findAll(@Query() query: QueryCustomerAddressDto) {
    return this.customerAddressesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail alamat customer' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.customerAddressesService.findOne(id);
  }

  @Post()
  @Roles(UserRole.Admin)
  @ApiOperation({ summary: 'Tambah alamat customer (admin)' })
  create(@Body() dto: CreateCustomerAddressDto) {
    return this.customerAddressesService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.Admin)
  @ApiOperation({ summary: 'Perbarui alamat customer (admin)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCustomerAddressDto,
  ) {
    return this.customerAddressesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.Admin)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hapus alamat customer (admin)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.customerAddressesService.remove(id);
  }
}
