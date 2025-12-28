import { EntryStatus } from './enums/entry-status.enum';
import { Weight } from './value-objects/weight.vo';
import { EmptyEntryError } from './errors/empty-entry.error';
import { EntryAlreadyValidatedError } from './errors/entry-already-validated.error';
import { randomUUID } from 'crypto';

type EntryItem = {
  productRef: string;
  family: string;
  subFamily?: string;
  weight: Weight;
};

export type CollecteEntryItemSnapshot = {
  productRef: string;
  family: string;
  subFamily?: string;
  weightKg: number;
};

export class CollecteEntry {
  private readonly _id: string;
  private status: EntryStatus = EntryStatus.EN_COURS;
  private readonly items: EntryItem[] = [];
  private readonly createdAt: Date;
  private _validatedAt?: Date;

  constructor(id: string = randomUUID(), createdAt: Date = new Date()) {
    this._id = id;
    this.createdAt = createdAt;
  }

  get entryId(): string {
    return this._id;
  }

  get entryValidatedAt(): Date | undefined {
    return this._validatedAt;
  }

  // Backward/interop getters used by infrastructure
  get id(): string {
    return this._id;
  }

  get validatedAt(): Date | undefined {
    return this._validatedAt;
  }

  get entryStatus(): EntryStatus {
    return this.status;
  }

  get entryCreatedAt(): Date {
    return this.createdAt;
  }

  get entryItems(): ReadonlyArray<CollecteEntryItemSnapshot> {
    return this.items.map((item) => ({
      productRef: item.productRef,
      family: item.family,
      subFamily: item.subFamily,
      weightKg: item.weight.valueKg,
    }));
  }

  static rehydrate(props: {
    id: string;
    status: EntryStatus;
    createdAt: Date;
    validatedAt?: Date;
    items?: CollecteEntryItemSnapshot[];
  }): CollecteEntry {
    const entry = new CollecteEntry(props.id, props.createdAt);

    if (props.items) {
      for (const item of props.items) {
        entry.addItem({
          productRef: item.productRef,
          family: item.family,
          subFamily: item.subFamily,
          weightKg: item.weightKg,
        });
      }
    }

    entry.status = props.status;
    entry._validatedAt = props.validatedAt;

    return entry;
  }

  addItem(input: {
    productRef: string;
    family: string;
    subFamily?: string;
    weightKg: number;
  }): void {
    this.ensureEditable();

    const weight = Weight.from(input.weightKg);

    this.items.push({
      productRef: input.productRef,
      family: input.family,
      subFamily: input.subFamily,
      weight,
    });
  }

  removeItem(index: number): void {
    this.ensureEditable();
    this.items.splice(index, 1);
  }

  validate(): void {
    this.ensureEditable();

    if (this.items.length === 0) {
      throw new EmptyEntryError();
    }

    this.status = EntryStatus.VALIDEE;
    this._validatedAt = new Date();
  }

  get totalWeightKg(): number {
    return this.items.reduce((sum, item) => sum + item.weight.valueKg, 0);
  }

  private ensureEditable(): void {
    if (this.status === EntryStatus.VALIDEE) {
      throw new EntryAlreadyValidatedError();
    }
  }
}
