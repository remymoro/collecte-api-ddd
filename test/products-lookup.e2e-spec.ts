// import { INestApplication } from '@nestjs/common';
// import { Test } from '@nestjs/testing';
// import request from 'supertest';
// import { ProductQueryController } from '../src/presentation/product/product-query.controller';
// import { FakeAuthGuard } from '../src/presentation/auth/fake-auth.guard';
// import { JwtAuthGuard } from '../src/infrastructure/auth/guards/jwt-auth.guard';
// import { ListProductsUseCase } from '../src/application/product/list-products.usecase';
// import { InMemoryProductRepository } from '../src/infrastructure/product/in-memory-product.repository';
// import { DomainExceptionFilter } from '../src/presentation/filters/domain-exception.filter';
// import { Product } from '../src/domain/product/product.entity';

// describe('Product lookup (e2e)', () => {
//   let app: INestApplication;

//   beforeEach(async () => {
//     const inactive = Product.create({ reference: 'ARCHIVED', family: 'Famille X' });
//     inactive.archive();

//     const moduleRef = await Test.createTestingModule({
//       controllers: [ProductQueryController],
//       providers: [
//         FakeAuthGuard,
//         ListProductsUseCase,
//         {
//           provide: 'ProductRepository',
//           useValue: new InMemoryProductRepository([
//             Product.create({ reference: 'ACTIVE', family: 'Protéines', subFamily: 'Sans porc' }),
//             inactive,
//           ]),
//         },
//       ],
//     })
//       .overrideGuard(JwtAuthGuard)
//       .useClass(FakeAuthGuard)
//       .compile();

//     app = moduleRef.createNestApplication();
//     app.useGlobalFilters(new DomainExceptionFilter());
//     await app.init();
//   });

//   afterEach(async () => {
//     await app.close();
//   });

//   it('retourne le produit actif par référence', async () => {
//     await request(app.getHttpServer())
//       .get('/products/ACTIVE')
//       .expect(200)
//       .expect((res) => {
//         expect(res.body).toEqual({
//           reference: 'ACTIVE',
//           family: 'Protéines',
//           subFamily: 'Sans porc',
//           isActive: true,
//         });
//       });
//   });

//   it('retourne 404 si la référence est inconnue', async () => {
//     await request(app.getHttpServer())
//       .get('/products/UNKNOWN')
//       .expect(404)
//       .expect((res) => {
//         expect(res.body.message).toBe('Product not found');
//       });
//   });

//   it('retourne 404 si le produit est archivé/inactif', async () => {
//     await request(app.getHttpServer())
//       .get('/products/ARCHIVED')
//       .expect(404)
//       .expect((res) => {
//         expect(res.body.message).toBe('Product not found');
//       });
//   });
// });
