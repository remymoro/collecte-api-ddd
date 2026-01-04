import {
  Controller,
  Get,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@infrastructure/auth/guards/jwt-auth.guard';
import { ListProductsUseCase } from '@application/product/list-products.usecase';
import { ProductResponseDto } from './dto/product-response.dto';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductQueryController {
  constructor(private readonly listProductsUseCase: ListProductsUseCase) {}

  @Get(':reference')
  async getByReference(
    @Param('reference') reference: string,
  ): Promise<ProductResponseDto> {
    const products = await this.listProductsUseCase.execute();

    const product = products.find(
      (p) => p.reference === reference && p.isActive,
    );

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return {
      reference: product.reference,
      family: product.family,
      subFamily: product.subFamily,
      isActive: product.isActive,
    };
  }
}
