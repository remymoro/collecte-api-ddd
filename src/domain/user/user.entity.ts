import { NoActiveCenterError } from './errors/no-active-center.error';
import { UserRole } from './enums/user-role.enum';
import { UserId } from './value-objects/user-id.vo';
import { CenterId } from '@domain/center/value-objects/center-id.vo';

export class User {
  private readonly _id: UserId;
  private readonly _username: string;
  private readonly _passwordHash: string;
  private readonly _centerId: CenterId | null;
  private readonly _role: UserRole;

  private constructor(
    id: UserId,
    username: string,
    passwordHash: string,
    centerId: CenterId | null,
    role: UserRole,
  ) {
    this._id = id;
    this._username = username;
    this._passwordHash = passwordHash;
    this._centerId = centerId;
    this._role = role;
  }

  // =========================
  // FACTORY MÉTIER
  // =========================
  static createForCenter(props: {
    username: string;
    passwordHash: string;
    centerId: CenterId;
  }): User {
    return new User(
      UserId.generate(),
      props.username,
      props.passwordHash,
      props.centerId,
      UserRole.BENEVOLE,
    );
  }

  // =========================
  // REHYDRATATION (INFRA)
  // =========================
  static hydrate(props: {
    id: UserId;
    username: string;
    passwordHash: string;
    centerId: CenterId | null;
    role: UserRole;
  }): User {
    return new User(
      props.id,
      props.username,
      props.passwordHash,
      props.centerId,
      props.role,
    );
  }

  // =========================
  // GETTERS
  // =========================
  get id(): UserId {
    return this._id;
  }

  get username(): string {
    return this._username;
  }

  get passwordHash(): string {
    return this._passwordHash;
  }

  get centerId(): CenterId | null {
    return this._centerId;
  }

  get role(): UserRole {
    return this._role;
  }

  ensureCanLogin(): void {
    if (this.role === UserRole.ADMIN) {
      return;
    }

    if (!this.centerId) {
      throw new NoActiveCenterError();
    }
  }
}