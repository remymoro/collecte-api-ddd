import { EntryStatus } from './enums/entry-status.enum';
import { Weight } from './value-objects/weight.vo';
import { EmptyEntryError } from './errors/empty-entry.error';
import { EntryAlreadyValidatedError } from './errors/entry-already-validated.error';
import { CollecteEntryId } from './value-objects/collecte-entry-id.vo';
import { CampaignId } from '@domain/campaign/value-objects/campaign-id.vo';
import { StoreId } from '@domain/store/value-objects/store-id.vo';
import { CenterId } from '@domain/center/value-objects/center-id.vo';
import { UserId } from '@domain/user/value-objects/user-id.vo';

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

export type CollecteEntryContext = {
  campaignId: CampaignId;
  storeId: StoreId;
  centerId: CenterId;
  userId: UserId;
};

export class CollecteEntry {
  private readonly _id: CollecteEntryId;
  private readonly _campaignId: CampaignId;
  private readonly _storeId: StoreId;
  private readonly _centerId: CenterId;
  private readonly _createdBy: UserId;
  private _status: EntryStatus = EntryStatus.EN_COURS;
  private readonly items: EntryItem[] = [];
  private readonly _createdAt: Date;
  private _validatedAt?: Date;

  private constructor(
    context: CollecteEntryContext,
    id: CollecteEntryId = CollecteEntryId.generate(),
    createdAt: Date = new Date(),
  ) {
    this._id = id;
    this._createdAt = createdAt;

    this._campaignId = context.campaignId;
    this._storeId = context.storeId;
    this._centerId = context.centerId;
    this._createdBy = context.userId;
  }

  static create(context: CollecteEntryContext): CollecteEntry {
    return new CollecteEntry(context);
  }

  get id(): CollecteEntryId {
    return this._id;
  }

  get status(): EntryStatus {
    return this._status;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get validatedAt(): Date | undefined {
    return this._validatedAt;
  }

  get campaignId(): CampaignId {
    return this._campaignId;
  }

  get storeId(): StoreId {
    return this._storeId;
  }

  get centerId(): CenterId {
    return this._centerId;
  }

  get createdBy(): UserId {
    return this._createdBy;
  }

  get itemsSnapshot(): ReadonlyArray<CollecteEntryItemSnapshot> {
    return this.items.map((item) => ({
      productRef: item.productRef,
      family: item.family,
      subFamily: item.subFamily,
      weightKg: item.weight.valueKg,
    }));
  }

  // Backward compatibility getters
  get entryId(): string {
    return this._id.toString();
  }

  get entryCampaignId(): string {
    return this._campaignId.toString();
  }

  get entryStoreId(): string {
    return this._storeId.toString();
  }

  get entryCenterId(): string {
    return this._centerId.toString();
  }

  get entryCreatedBy(): string {
    return this._createdBy.toString();
  }

  get entryStatus(): EntryStatus {
    return this._status;
  }

  get entryCreatedAt(): Date {
    return this._createdAt;
  }

  get entryValidatedAt(): Date | undefined {
    return this._validatedAt;
  }

  get entryItems(): ReadonlyArray<CollecteEntryItemSnapshot> {
    return this.itemsSnapshot;
  }



  static rehydrate(props: {
    id: CollecteEntryId;
    context: CollecteEntryContext;
    status: EntryStatus;
    createdAt: Date;
    validatedAt?: Date;
    items?: CollecteEntryItemSnapshot[];
  }): CollecteEntry {
    const entry = new CollecteEntry(props.context, props.id, props.createdAt);

    if (props.items) {
      for (const item of props.items) {
        entry.pushItemRaw({
          productRef: item.productRef,
          family: item.family,
          subFamily: item.subFamily,
          weight: Weight.from(item.weightKg),
        });
      }
    }

    entry._status = props.status;
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

    this.pushItemRaw({
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

    this._status = EntryStatus.VALIDEE;
    this._validatedAt = new Date();
  }

  get totalWeightKg(): number {
    return this.items.reduce((sum, item) => sum + item.weight.valueKg, 0);
  }

  private ensureEditable(): void {
    if (this._status === EntryStatus.VALIDEE) {
      throw new EntryAlreadyValidatedError();
    }
  }

  private pushItemRaw(item: EntryItem): void {
    this.items.push(item);
  }
}
