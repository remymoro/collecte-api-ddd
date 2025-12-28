import {
  Controller,
  Post,
  Patch,
  Get,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { FakeAuthGuard } from '../auth/fake-auth.guard';
import { CreateProductUseCase } from '../../application/product/create-product.usecase';
import { UpdateProductUseCase } from '../../application/product/update-product.usecase';
import { ArchiveProductUseCase } from '../../application/product/archive-product.usecase';
import { ListProductsUseCase } from '../../application/product/list-products.usecase';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';

@Controller('admin/products')
@UseGuards(FakeAuthGuard)
export class ProductController {
  constructor(
    private readonly createProduct: CreateProductUseCase,
    private readonly updateProduct: UpdateProductUseCase,
    private readonly archiveProduct: ArchiveProductUseCase,
    private readonly listProductsUseCase: ListProductsUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateProductDto): Promise<ProductResponseDto> {
    const product = await this.createProduct.execute(dto);

    return this.toResponse(product);
  }

  @Patch(':reference')
  async update(
    @Param('reference') reference: string,
    @Body() dto: { family: string; subFamily?: string },
  ): Promise<ProductResponseDto> {
    const product = await this.updateProduct.execute(reference, dto);

    return this.toResponse(product);
  }

  @Patch(':reference/archive')
  async archive(@Param('reference') reference: string): Promise<ProductResponseDto> {
    const product = await this.archiveProduct.execute(reference);

    return this.toResponse(product);
  }

  @Get()
  async listAll(): Promise<ProductResponseDto[]> {
    const products = await this.listProductsUseCase.execute();

    return products.map((p) => this.toResponse(p));
  }

  private toResponse(product: { reference: string; family: string; subFamily?: string; isActive: boolean }): ProductResponseDto {
    return {
      reference: product.reference,
      family: product.family,
      subFamily: product.subFamily,
      isActive: product.isActive,
    };
  }
}
