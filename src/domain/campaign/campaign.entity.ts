// src/domain/campaign/campaign.entity.ts

import { CampaignStatus } from './enums/campaign-status.enum';
import { InvalidCampaignPeriodError } from './errors/invalid-campaign-period.error';
import { InvalidStatusTransitionError } from './errors/invalid-status-transition.error';
import { CampaignCannotBeModifiedError } from './errors/campaign-cannot-be-modified.error';
import { CannotCloseCampaignError } from './errors/cannot-close-campaign.error';
import { CannotCancelClosedCampaignError } from './errors/cannot-cancel-closed-campaign.error';

export class Campaign {
  constructor(
    private readonly _id: string,
    private _name: string,
    private readonly _year: number,
    private _startDate: Date,
    private _endDate: Date,
    private _gracePeriodEndDate: Date,
    private _status: CampaignStatus,
    private _description: string | undefined,
    private _objectives: string | undefined,
    private readonly _createdBy: string,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _closedBy: string | undefined,
    private _closedAt: Date | undefined,
  ) {
    this.validateDates();
  }

  // ============================
  // FACTORY - Création
  // ============================

  static create(
    name: string,
    year: number,
    startDate: Date,
    endDate: Date,
    gracePeriodDays: number,
    createdBy: string,
    description?: string,
    objectives?: string,
  ): Campaign {
    const gracePeriodEndDate = new Date(endDate);
    gracePeriodEndDate.setDate(gracePeriodEndDate.getDate() + gracePeriodDays);

    return new Campaign(
      crypto.randomUUID(),
      name,
      year,
      startDate,
      endDate,
      gracePeriodEndDate,
      CampaignStatus.PLANIFIEE,
      description,
      objectives,
      createdBy,
      new Date(),
      new Date(),
      undefined,
      undefined,
    );
  }

  // ============================
  // FACTORY - Rehydratation
  // ============================

  static rehydrate(props: {
    id: string;
    name: string;
    year: number;
    startDate: Date;
    endDate: Date;
    gracePeriodEndDate: Date;
    status: CampaignStatus;
    description?: string;
    objectives?: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    closedBy?: string;
    closedAt?: Date;
  }): Campaign {
    return new Campaign(
      props.id,
      props.name,
      props.year,
      props.startDate,
      props.endDate,
      props.gracePeriodEndDate,
      props.status,
      props.description,
      props.objectives,
      props.createdBy,
      props.createdAt,
      props.updatedAt,
      props.closedBy,
      props.closedAt,
    );
  }

  // ============================
  // RÈGLES MÉTIER - Validation
  // ============================

  private validateDates(): void {
    const startYear = this._startDate.getFullYear();
    const endYear = this._endDate.getFullYear();

    if (startYear !== this._year || endYear !== this._year) {
      throw new InvalidCampaignPeriodError(
        `Campaign ${this._year} must start and end within the same year`,
      );
    }

    if (this._endDate <= this._startDate) {
      throw new InvalidCampaignPeriodError(
        'End date must be after start date',
      );
    }

    if (this._gracePeriodEndDate < this._endDate) {
      throw new InvalidCampaignPeriodError(
        'Grace period end date must be equal to or after end date',
      );
    }

    const durationMs = this._endDate.getTime() - this._startDate.getTime();
    const durationDays = durationMs / (1000 * 60 * 60 * 24);

    if (durationDays < 1) {
      throw new InvalidCampaignPeriodError(
        'Campaign must last at least 1 day',
      );
    }
  }

  // ============================
  // RÈGLES MÉTIER - Informations
  // ============================

  updateInfo(
    name: string,
    startDate: Date,
    endDate: Date,
    gracePeriodEndDate: Date,
    description?: string,
    objectives?: string,
  ): void {
    if (this._status !== CampaignStatus.PLANIFIEE) {
      throw new CampaignCannotBeModifiedError(
        this._id,
        'Only planned campaigns can be modified',
      );
    }

    this._name = name;
    this._startDate = startDate;
    this._endDate = endDate;
    this._gracePeriodEndDate = gracePeriodEndDate;
    this._description = description;
    this._objectives = objectives;
    this._updatedAt = new Date();

    this.validateDates();
  }

  // ============================
  // RÈGLES MÉTIER - Machine à États
  // ============================

  start(): void {
    if (this._status !== CampaignStatus.PLANIFIEE) {
      throw new InvalidStatusTransitionError(this._status, CampaignStatus.EN_COURS);
    }

    this._status = CampaignStatus.EN_COURS;
    this._updatedAt = new Date();
  }

  complete(): void {
    if (this._status !== CampaignStatus.EN_COURS) {
      throw new InvalidStatusTransitionError(this._status, CampaignStatus.TERMINEE);
    }

    this._status = CampaignStatus.TERMINEE;
    this._updatedAt = new Date();
  }

  close(closedBy: string): void {
    if (this._status === CampaignStatus.CLOTUREE) {
      throw new CannotCloseCampaignError('Campaign is already closed');
    }

    if (this._status === CampaignStatus.ANNULEE) {
      throw new CannotCloseCampaignError('Cannot close a cancelled campaign');
    }

    if (this._status === CampaignStatus.PLANIFIEE) {
      throw new CannotCloseCampaignError('Cannot close a campaign that has not started');
    }

    this._status = CampaignStatus.CLOTUREE;
    this._closedBy = closedBy;
    this._closedAt = new Date();
    this._updatedAt = new Date();
  }

  cancel(): void {
    if (this._status === CampaignStatus.CLOTUREE) {
      throw new CannotCancelClosedCampaignError(this._id);
    }

    if (this._status === CampaignStatus.ANNULEE) {
      return; // Déjà annulée
    }

    this._status = CampaignStatus.ANNULEE;
    this._updatedAt = new Date();
  }

  // ============================
  // REQUÊTES
  // ============================

  isInOfficialPeriod(date: Date = new Date()): boolean {
    return date >= this._startDate && date <= this._endDate;
  }

  isInGracePeriod(date: Date = new Date()): boolean {
    return date > this._endDate && date <= this._gracePeriodEndDate;
  }

  canAcceptEntries(date: Date = new Date()): boolean {
    if (this._status !== CampaignStatus.EN_COURS && 
        this._status !== CampaignStatus.TERMINEE) {
      return false;
    }

    return date <= this._gracePeriodEndDate;
  }

  canBeModified(): boolean {
    return this._status === CampaignStatus.PLANIFIEE;
  }

  isActive(): boolean {
    return this._status === CampaignStatus.EN_COURS;
  }

  isClosed(): boolean {
    return this._status === CampaignStatus.CLOTUREE;
  }

  // ============================
  // GETTERS
  // ============================

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get year(): number {
    return this._year;
  }

  get startDate(): Date {
    return this._startDate;
  }

  get endDate(): Date {
    return this._endDate;
  }

  get gracePeriodEndDate(): Date {
    return this._gracePeriodEndDate;
  }

  get status(): CampaignStatus {
    return this._status;
  }

  get description(): string | undefined {
    return this._description;
  }

  get objectives(): string | undefined {
    return this._objectives;
  }

  get createdBy(): string {
    return this._createdBy;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get closedBy(): string | undefined {
    return this._closedBy;
  }

  get closedAt(): Date | undefined {
    return this._closedAt;
  }

  // ============================
  // MÉTHODES UTILITAIRES
  // ============================

  getDurationDays(): number {
    const durationMs = this._endDate.getTime() - this._startDate.getTime();
    return Math.ceil(durationMs / (1000 * 60 * 60 * 24));
  }

  getGracePeriodDays(): number {
    const durationMs = this._gracePeriodEndDate.getTime() - this._endDate.getTime();
    return Math.ceil(durationMs / (1000 * 60 * 60 * 24));
  }
}