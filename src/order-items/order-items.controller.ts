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
import { CreateOrderItemDto } from './dto/create-order-item.dto.js';
import { QueryOrderItemDto } from './dto/query-order-item.dto.js';
import { UpdateOrderItemDto } from './dto/update-order-item.dto.js';
import { OrderItemsService } from './order-items.service.js';

@ApiTags('Order Items')
@ApiBearerAuth()
@Controller('order-items')
export class OrderItemsController {
  constructor(private readonly orderItemsService: OrderItemsService) {}

  @Get()
  @ApiOperation({ summary: 'Daftar item pesanan' })
  findAll(@Query() query: QueryOrderItemDto) {
    return this.orderItemsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail item pesanan' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.orderItemsService.findOne(id);
  }

  @Post()
  @Roles(UserRole.Admin)
  @ApiOperation({ summary: 'Tambah item ke pesanan (admin)' })
  create(@Body() dto: CreateOrderItemDto) {
    return this.orderItemsService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.Admin)
  @ApiOperation({ summary: 'Ubah quantity item pesanan (admin)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderItemDto,
  ) {
    return this.orderItemsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.Admin)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hapus item pesanan (admin)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.orderItemsService.remove(id);
  }
}
