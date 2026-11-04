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
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { UserRole } from '../users/entities/user.entity.js';
import { CreatePublisherDto } from './dto/create-publisher.dto.js';
import { UpdatePublisherDto } from './dto/update-publisher.dto.js';
import { PublishersService } from './publishers.service.js';

@ApiTags('Publishers')
@ApiBearerAuth()
@Controller('publishers')
export class PublishersController {
  constructor(private readonly publishersService: PublishersService) {}

  @Get()
  @ApiOperation({ summary: 'Daftar penerbit' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.publishersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail penerbit beserta buku' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.publishersService.findOne(id);
  }

  @Post()
  @Roles(UserRole.Admin)
  @ApiOperation({ summary: 'Tambah penerbit (admin)' })
  create(@Body() dto: CreatePublisherDto) {
    return this.publishersService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.Admin)
  @ApiOperation({ summary: 'Perbarui penerbit (admin)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePublisherDto,
  ) {
    return this.publishersService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.Admin)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hapus penerbit (admin)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.publishersService.remove(id);
  }
}
