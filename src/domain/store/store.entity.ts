import crypto from 'crypto';

import { StoreStatus } from './enums/store-status.enum';
import { CannotModifyClosedStoreError } from './errors/cannot-modify-closed-store.error';
import { StoreAlreadyClosedError } from './errors/store-already-closed.error';
import { StoreImage } from './value-objects/store-image.vo';
import { StoreImageNotFoundError } from './errors/store-image-not-found.error';

export class Store {
  // ============================
  // CONSTRUCTOR (PRIVÉ)
  // ============================

  private constructor(
    private readonly _id: string,
    private readonly _centerId: string,
    private _name: string,
    private _address: string,
    private _city: string,
    private _postalCode: string,
    private _phone: string | undefined,
    private _contactName: string | undefined,
    private _status: StoreStatus,
    private _statusChangedAt: Date | undefined,
    private _statusChangedBy: string | undefined,
    private _statusReason: string | undefined,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _images: StoreImage[],
  ) {}

  // ============================
  // FACTORY — CRÉATION
  // ============================

  static create(
    centerId: string,
    name: string,
    address: string,
    city: string,
    postalCode: string,
    phone?: string,
    contactName?: string,
  ): Store {
    return new Store(
      crypto.randomUUID(),
      centerId,
      name,
      address,
      city,
      postalCode,
      phone,
      contactName,
      StoreStatus.DISPONIBLE,
      undefined,
      undefined,
      undefined,
      new Date(),
      new Date(),
      [], // images vides à la création
    );
  }

  // ============================
  // FACTORY — RÉHYDRATATION
  // ============================

  static rehydrate(props: {
    id: string;
    centerId: string;
    name: string;
    address: string;
    city: string;
    postalCode: string;
    phone?: string;
    contactName?: string;
    status: StoreStatus;
    statusChangedAt?: Date;
    statusChangedBy?: string;
    statusReason?: string;
    createdAt: Date;
    updatedAt: Date;
    images: StoreImage[];
  }): Store {
    return new Store(
      props.id,
      props.centerId,
      props.name,
      props.address,
      props.city,
      props.postalCode,
      props.phone,
      props.contactName,
      props.status,
      props.statusChangedAt,
      props.statusChangedBy,
      props.statusReason,
      props.createdAt,
      props.updatedAt,
      props.images,
    );
  }

  // ============================
  // RÈGLES MÉTIER — INFORMATIONS
  // ============================

  updateInfo(
    name: string,
    address: string,
    city: string,
    postalCode: string,
    phone?: string,
    contactName?: string,
  ): void {
    if (this.isClosed()) {
      throw new CannotModifyClosedStoreError(this._id);
    }

    this._name = name;
    this._address = address;
    this._city = city;
    this._postalCode = postalCode;
    this._phone = phone;
    this._contactName = contactName;
    this._updatedAt = new Date();
  }

  // ============================
  // RÈGLES MÉTIER — STATUT
  // ============================

  markAsUnavailable(userId: string, reason: string): void {
    if (this.isClosed()) {
      throw new StoreAlreadyClosedError(this._id);
    }

    this._status = StoreStatus.INDISPONIBLE;
    this._statusChangedAt = new Date();
    this._statusChangedBy = userId;
    this._statusReason = reason;
    this._updatedAt = new Date();
  }

  markAsAvailable(userId: string): void {
    if (this.isClosed()) {
      throw new StoreAlreadyClosedError(this._id);
    }

    this._status = StoreStatus.DISPONIBLE;
    this._statusChangedAt = new Date();
    this._statusChangedBy = userId;
    this._statusReason = undefined;
    this._updatedAt = new Date();
  }

  close(userId: string, reason: string): void {
    if (this.isClosed()) {
      throw new StoreAlreadyClosedError(this._id);
    }

    this._status = StoreStatus.FERME;
    this._statusChangedAt = new Date();
    this._statusChangedBy = userId;
    this._statusReason = reason;
    this._updatedAt = new Date();
  }

  // ============================
  // RÈGLES MÉTIER — IMAGES
  // ============================

  addImage(url: string, isPrimary = false): void {
    const newImage = StoreImage.create(url, isPrimary);

    if (isPrimary) {
      this._images = this._images.map((img) => img.unsetAsPrimary());
    }

    this._images.push(newImage);
    this._updatedAt = new Date();
  }

  removeImage(url: string): void {
    const exists = this._images.some((img) => img.url === url);

    if (!exists) {
      throw new StoreImageNotFoundError(this._id, url);
    }

    this._images = this._images.filter((img) => img.url !== url);
    this._updatedAt = new Date();
  }

  setPrimaryImage(url: string): void {
    const exists = this._images.some((img) => img.url === url);

    if (!exists) {
      throw new StoreImageNotFoundError(this._id, url);
    }

    this._images = this._images.map((img) =>
      img.url === url ? img.setAsPrimary() : img.unsetAsPrimary(),
    );

    this._updatedAt = new Date();
  }

  // ============================
  // REQUÊTES MÉTIER
  // ============================

  isAvailableForCollection(): boolean {
    return this._status === StoreStatus.DISPONIBLE;
  }

  isClosed(): boolean {
    return this._status === StoreStatus.FERME;
  }

  // ============================
  // GETTERS
  // ============================

  get id(): string {
    return this._id;
  }

  get centerId(): string {
    return this._centerId;
  }

  get name(): string {
    return this._name;
  }

  get address(): string {
    return this._address;
  }

  get city(): string {
    return this._city;
  }

  get postalCode(): string {
    return this._postalCode;
  }

  get phone(): string | undefined {
    return this._phone;
  }

  get contactName(): string | undefined {
    return this._contactName;
  }

  get status(): StoreStatus {
    return this._status;
  }

  get statusChangedAt(): Date | undefined {
  return this._statusChangedAt;
}

get statusChangedBy(): string | undefined {
  return this._statusChangedBy;
}

get statusReason(): string | undefined {
  return this._statusReason;
}

get createdAt(): Date {
  return this._createdAt;
}

get updatedAt(): Date {
  return this._updatedAt;
}

  get images(): StoreImage[] {
    return [...this._images]; // copie défensive
  }

  get primaryImage(): StoreImage | undefined {
    return this._images.find((img) => img.isPrimary);
  }

  
}
