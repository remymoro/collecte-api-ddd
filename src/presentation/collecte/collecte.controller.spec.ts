import { Test, TestingModule } from '@nestjs/testing';
import { CollecteController } from './collecte.controller';
import { CreateEntryUseCase } from '../../application/collecte/create-entry.usecase';
import { ListEntriesUseCase } from '../../application/collecte/list-entries.usecase';
import { ValidateEntryUseCase } from '../../application/collecte/validate-entry.usecase';
import { GetEntryUseCase } from '../../application/collecte/get-entry.usecase';
import { AddItemUseCase } from '../../application/collecte/add-item.usecase';
import { RemoveItemUseCase } from '../../application/collecte/remove-item.usecase';

describe('CollecteController', () => {
  let controller: CollecteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollecteController],
      providers: [
        {
          provide: CreateEntryUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: ListEntriesUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: ValidateEntryUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: GetEntryUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: AddItemUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: RemoveItemUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CollecteController>(CollecteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
