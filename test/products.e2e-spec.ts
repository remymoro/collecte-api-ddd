import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { ProductController } from '../src/presentation/product/product.controller';
import { FakeAuthGuard } from '../src/presentation/auth/fake-auth.guard';
import { CreateProductUseCase } from '../src/application/product/create-product.usecase';
import { UpdateProductUseCase } from '../src/application/product/update-product.usecase';
import { ArchiveProductUseCase } from '../src/application/product/archive-product.usecase';
import { ListProductsUseCase } from '../src/application/product/list-products.usecase';
import { InMemoryProductRepository } from '../src/infrastructure/product/in-memory-product.repository';
import { DomainExceptionFilter } from '../src/presentation/filters/domain-exception.filter';
import { Product } from '../src/domain/product/product.entity';

describe('Product admin (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        FakeAuthGuard,
        CreateProductUseCase,
        UpdateProductUseCase,
        ArchiveProductUseCase,
        ListProductsUseCase,
        {
          provide: 'ProductRepository',
          useValue: new InMemoryProductRepository([
            Product.create({ reference: 'EXISTING', family: 'Ancienne famille' }),
          ]),
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalFilters(new DomainExceptionFilter());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  // ---------------- CREATE ----------------

  it('admin crée un produit', async () => {
    await request(app.getHttpServer())
      .post('/admin/products')
      .send({
        reference: 'PROD_1',
        family: 'Protéines',
        subFamily: 'Sans porc',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toEqual({
          reference: 'PROD_1',
          family: 'Protéines',
          subFamily: 'Sans porc',
          isActive: true,
        });
      });
  });

  it('refuse un produit déjà existant', async () => {
    await request(app.getHttpServer())
      .post('/admin/products')
      .send({
        reference: 'EXISTING',
        family: 'Nouvelle famille',
      })
      .expect(409)
      .expect((res) => {
        expect(res.body.error).toBe('PRODUCT_ALREADY_EXISTS');
      });
  });

  // ---------------- UPDATE ----------------

  it('met à jour un produit existant', async () => {
    await request(app.getHttpServer())
      .patch('/admin/products/EXISTING')
      .send({
        family: 'Famille corrigée',
        subFamily: 'Sous-famille corrigée',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual({
          reference: 'EXISTING',
          family: 'Famille corrigée',
          subFamily: 'Sous-famille corrigée',
          isActive: true,
        });
      });
  });

  it('retourne 404 si le produit n’existe pas', async () => {
    await request(app.getHttpServer())
      .patch('/admin/products/UNKNOWN')
      .send({ family: 'Test' })
      .expect(404)
      .expect((res) => {
        expect(res.body.error).toBe('PRODUCT_NOT_FOUND');
      });
  });

  // ---------------- LIST ----------------

  it('liste tous les produits du catalogue', async () => {
    await request(app.getHttpServer())
      .post('/admin/products')
      .send({
        reference: 'PROD_A',
        family: 'Famille A',
      });

    await request(app.getHttpServer())
      .post('/admin/products')
      .send({
        reference: 'PROD_B',
        family: 'Famille B',
        subFamily: 'Sous B',
      });

    const res = await request(app.getHttpServer())
      .get('/admin/products')
      .expect(200);

    expect(res.body).toEqual(
      expect.arrayContaining([
        { reference: 'EXISTING', family: 'Ancienne famille', isActive: true },
        { reference: 'PROD_A', family: 'Famille A', isActive: true },
        { reference: 'PROD_B', family: 'Famille B', subFamily: 'Sous B', isActive: true },
      ]),
    );
  });
});
