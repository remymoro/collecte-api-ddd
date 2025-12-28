import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { CollecteController } from '../src/presentation/collecte/collecte.controller';
import { FakeAuthGuard } from '../src/presentation/auth/fake-auth.guard';
import { CreateEntryUseCase } from '../src/application/collecte/create-entry.usecase';
import { ListEntriesUseCase } from '../src/application/collecte/list-entries.usecase';
import { ValidateEntryUseCase } from '../src/application/collecte/validate-entry.usecase';
import { GetEntryUseCase } from '../src/application/collecte/get-entry.usecase';
import { AddItemUseCase } from '../src/application/collecte/add-item.usecase';
import { RemoveItemUseCase } from '../src/application/collecte/remove-item.usecase';
import { InMemoryCollecteEntryRepository } from '../src/infrastructure/collecte/in-memory-collecte-entry.repository';
import { InMemoryProductRepository } from '../src/infrastructure/product/in-memory-product.repository';
import { Product } from '../src/domain/product/product.entity';
import { DomainExceptionFilter } from '../src/presentation/filters/domain-exception.filter';

describe('Collecte entries (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [CollecteController],
      providers: [
        FakeAuthGuard,
        CreateEntryUseCase,
        ListEntriesUseCase,
        ValidateEntryUseCase,
        GetEntryUseCase,
        AddItemUseCase,
        RemoveItemUseCase,
        {
          provide: 'CollecteEntryRepository',
          useClass: InMemoryCollecteEntryRepository,
        },
        {
          provide: 'ProductRepository',
          useValue: new InMemoryProductRepository([
            Product.create({ reference: 'PROD_1', family: 'Famille 1', subFamily: 'SousFamille 1' }),
            Product.create({ reference: 'PROD_2', family: 'Protéines', subFamily: 'Sans porc' }),
            Product.create({ reference: 'PROD_3', family: 'Divers' }),
          ]),
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new DomainExceptionFilter());
    await app.init();
  });

  afterEach(async () => {
    await app?.close();
  });

  it('workflow bénévole terrain (draft -> validate -> immutable)', async () => {
    const created = await request(app.getHttpServer())
      .post('/collecte/entries')
      .send({
        items: [],
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.totalWeightKg).toBe(0);
        expect(res.body.status).toBe('EN_COURS');
        expect(typeof res.body.id).toBe('string');
      });

    const entryId = created.body.id;

    await request(app.getHttpServer())
      .patch(`/collecte/entries/${entryId}/items`)
      .send({ productRef: 'PROD_1', weightKg: 10 })
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('EN_COURS');
        expect(res.body.totalWeightKg).toBe(10);
      });

    await request(app.getHttpServer())
      .delete(`/collecte/entries/${entryId}/items/0`)
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('EN_COURS');
        expect(res.body.totalWeightKg).toBe(0);
      });

    await request(app.getHttpServer())
      .patch(`/collecte/entries/${entryId}/items`)
      .send({ productRef: 'PROD_2', weightKg: 5 })
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('EN_COURS');
        expect(res.body.totalWeightKg).toBe(5);
      });

    await request(app.getHttpServer())
      .get(`/collecte/entries/${entryId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe(entryId);
        expect(res.body.status).toBe('EN_COURS');
        expect(res.body.totalWeightKg).toBe(5);
        expect(res.body.items).toEqual([
          {
            productRef: 'PROD_2',
            family: 'Protéines',
            subFamily: 'Sans porc',
            weightKg: 5,
          },
        ]);
      });

    await request(app.getHttpServer())
      .post(`/collecte/entries/${entryId}/validate`)
      .expect(201)
      .expect((res) => {
        expect(res.body.status).toBe('VALIDEE');
        expect(res.body.totalWeightKg).toBe(5);
        expect(typeof res.body.validatedAt).toBe('string');
        expect(Number.isNaN(Date.parse(res.body.validatedAt))).toBe(false);
      });

    await request(app.getHttpServer())
      .patch(`/collecte/entries/${entryId}/items`)
      .send({ productRef: 'PROD_3', weightKg: 1 })
      .expect(409);

    const response = await request(app.getHttpServer())
      .get('/collecte/entries')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);

    expect(response.body[0].totalWeightKg).toBe(5);
    expect(response.body[0].status).toBe('VALIDEE');
    expect(typeof response.body[0].createdAt).toBe('string');
    expect(Number.isNaN(Date.parse(response.body[0].createdAt))).toBe(false);
  });

  it('retourne 422 si productRef inconnue', async () => {
    const created = await request(app.getHttpServer())
      .post('/collecte/entries')
      .send({ items: [] })
      .expect(201);

    const entryId = created.body.id;

    await request(app.getHttpServer())
      .patch(`/collecte/entries/${entryId}/items`)
      .send({ productRef: 'UNKNOWN_REF', weightKg: 1 })
      .expect(404)
      .expect((res) => {
        expect(res.body.error).toBe('PRODUCT_NOT_FOUND');
      });
  });

  
});
