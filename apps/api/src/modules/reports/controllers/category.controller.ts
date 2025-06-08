import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
  ParseEnumPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../../modules/auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CategoryService } from '../services/category.service';
import {
  CategoryDto,
  UpdateCategoryDto,
  CategoryResponseDto,
  CategoryTreeDto,
} from '../dto/category.dto';
import { UserRole, MunicipalityDepartment } from '@kentnabiz/shared';

@ApiTags('report-categories')
@Controller('report-categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.CITIZEN,
    UserRole.TEAM_MEMBER,
    UserRole.DEPARTMENT_SUPERVISOR,
    UserRole.SYSTEM_ADMIN
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tüm kategorileri listele veya departmana göre filtrele' })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: Boolean,
    description: 'Pasif kategorileri de listele',
  })
  @ApiQuery({
    name: 'departmentCode',
    required: false,
    enum: MunicipalityDepartment,
    description: 'Departman koduna göre filtrele',
  })
  @ApiResponse({
    status: 200,
    description: 'Kategoriler başarıyla getirildi',
    type: [CategoryResponseDto],
  })
  async findAll(
    @Query('includeInactive') includeInactive = false,
    @Query('departmentCode', new ParseEnumPipe(MunicipalityDepartment, { optional: true }))
    departmentCode?: MunicipalityDepartment
  ): Promise<CategoryResponseDto[]> {
    if (departmentCode) {
      return this.categoryService.findAllByDepartmentCode(departmentCode);
    }
    return this.categoryService.findAll(includeInactive);
  }

  @Get('tree')
  @ApiOperation({ summary: 'Kategorileri hiyerarşik ağaç yapısında getir' })
  @ApiResponse({
    status: 200,
    description: 'Kategori ağacı başarıyla getirildi',
    type: [CategoryTreeDto],
  })
  async getTree(): Promise<CategoryTreeDto[]> {
    return this.categoryService.getCategoryTree();
  }

  @Get(':id')
  @ApiOperation({ summary: "ID'ye göre kategori getir" })
  @ApiParam({ name: 'id', description: 'Kategori ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Kategori başarıyla getirildi',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Kategori bulunamadı' })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<CategoryResponseDto> {
    return this.categoryService.findById(id);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Koda göre kategori getir' })
  @ApiParam({ name: 'code', description: 'Kategori kodu', type: String })
  @ApiResponse({
    status: 200,
    description: 'Kategori başarıyla getirildi',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Kategori bulunamadı' })
  async findByCode(@Param('code') code: string): Promise<CategoryResponseDto> {
    return this.categoryService.findByCode(code);
  }

  @Get('parent/:parentId')
  @ApiOperation({ summary: 'Üst kategoriye göre alt kategorileri getir' })
  @ApiParam({
    name: 'parentId',
    description: 'Üst kategori ID (0 için ana kategoriler)',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Alt kategoriler başarıyla getirildi',
    type: [CategoryResponseDto],
  })
  async findByParentId(
    @Param('parentId', ParseIntPipe) parentId: number
  ): Promise<CategoryResponseDto[]> {
    return this.categoryService.findByParentId(parentId === 0 ? null : parentId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SYSTEM_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Yeni kategori oluştur' })
  @ApiResponse({
    status: 201,
    description: 'Kategori başarıyla oluşturuldu',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Geçersiz veri' })
  async create(@Body() categoryDto: CategoryDto): Promise<CategoryResponseDto> {
    return this.categoryService.create(categoryDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SYSTEM_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kategori güncelle' })
  @ApiParam({ name: 'id', description: 'Kategori ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Kategori başarıyla güncellendi',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Kategori bulunamadı' })
  @ApiResponse({ status: 400, description: 'Geçersiz veri' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateCategoryDto
  ): Promise<CategoryResponseDto> {
    return this.categoryService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SYSTEM_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kategori sil' })
  @ApiParam({ name: 'id', description: 'Kategori ID', type: Number })
  @ApiResponse({ status: 200, description: 'Kategori başarıyla silindi' })
  @ApiResponse({ status: 404, description: 'Kategori bulunamadı' })
  @ApiResponse({ status: 400, description: 'Kategori silinemedi (alt kategorileri var)' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.categoryService.delete(id);
  }
}
