import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator.js';
import { UserRole } from '../users/entities/user.entity.js';
import { BookAuthorsService } from './book-authors.service.js';
import { AssignBookAuthorDto } from './dto/assign-book-author.dto.js';
import { QueryBookAuthorDto } from './dto/query-book-author.dto.js';

@ApiTags('Book Authors')
@ApiBearerAuth()
@Controller('book-authors')
export class BookAuthorsController {
  constructor(private readonly bookAuthorsService: BookAuthorsService) {}

  @Get()
  @ApiOperation({ summary: 'Daftar relasi buku dan penulis' })
  findAll(@Query() query: QueryBookAuthorDto) {
    return this.bookAuthorsService.findAll(query);
  }

  @Post()
  @Roles(UserRole.Admin)
  @ApiOperation({ summary: 'Hubungkan penulis dengan buku (admin)' })
  assign(@Body() dto: AssignBookAuthorDto) {
    return this.bookAuthorsService.assign(dto);
  }

  @Delete(':bookId/:authorId')
  @Roles(UserRole.Admin)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Putuskan relasi buku dan penulis (admin)' })
  remove(
    @Param('bookId', ParseUUIDPipe) bookId: string,
    @Param('authorId', ParseUUIDPipe) authorId: string,
  ) {
    return this.bookAuthorsService.remove(bookId, authorId);
  }
}
