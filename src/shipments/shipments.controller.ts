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
import { CreateShipmentDto } from './dto/create-shipment.dto.js';
import { QueryShipmentDto } from './dto/query-shipment.dto.js';
import { UpdateShipmentDto } from './dto/update-shipment.dto.js';
import { ShipmentsService } from './shipments.service.js';

@ApiTags('Shipments')
@ApiBearerAuth()
@Controller('shipments')
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @Get()
  @ApiOperation({ summary: 'Daftar pengiriman' })
  findAll(@Query() query: QueryShipmentDto) {
    return this.shipmentsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail pengiriman' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.shipmentsService.findOne(id);
  }

  @Post()
  @Roles(UserRole.Admin)
  @ApiOperation({ summary: 'Catat pengiriman (admin)' })
  create(@Body() dto: CreateShipmentDto) {
    return this.shipmentsService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.Admin)
  @ApiOperation({ summary: 'Perbarui pengiriman (admin)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateShipmentDto,
  ) {
    return this.shipmentsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.Admin)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hapus pengiriman (admin)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.shipmentsService.remove(id);
  }
}
