import { randomUUID } from 'crypto';

import { CenterInactiveReadOnlyError } from './errors/center-inactive-read-only.error';

export type CreateCenterProps = {
  name: string;
  address: string;
  city: string;
  postalCode: string;
};

export type RehydrateCenterProps = {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  isActive: boolean;
};

export class Center {
  private constructor(
    readonly id: string,
    readonly name: string,
    readonly address: string,
    readonly city: string,
    readonly postalCode: string,
    readonly isActive: boolean,
  ) {}

  /** 🟢 Création métier */
  static create(props: CreateCenterProps): Center {
    return new Center(
      randomUUID(),
      props.name.trim(),
      props.address.trim(),
      props.city.trim(),
      props.postalCode.trim(),
      true,
    );
  }

  /** 🔁 Réhydratation (DB → Domaine) */
  static rehydrate(props: RehydrateCenterProps): Center {
    return new Center(
      props.id,
      props.name,
      props.address,
      props.city,
      props.postalCode,
      props.isActive,
    );
  }

  /** 📝 Mise à jour des informations métier */
  updateInfo(
    name: string,
    address: string,
    city: string,
    postalCode: string,
  ): Center {
    this.assertActive();

    return new Center(
      this.id,
      name.trim(),
      address.trim(),
      city.trim(),
      postalCode.trim(),
      this.isActive,
    );
  }

  /**
   * ✅ Règle métier : un center inactif est en lecture seule
   * Toute écriture doit appeler cette méthode avant de muter.
   */
  assertActive(): void {
    if (!this.isActive) {
      throw new CenterInactiveReadOnlyError(this.id);
    }
  }

  /**
   * Query métier : un center est modifiable uniquement s'il est actif
   */
  canBeModified(): boolean {
    return this.isActive;
  }

  /** ❌ Désactivation métier */
  deactivate(): Center {
    this.assertActive();

    return new Center(
      this.id,
      this.name,
      this.address,
      this.city,
      this.postalCode,
      false,
    );
  }

  /** ✅ Réactivation métier */
  activate(): Center {
    return new Center(
      this.id,
      this.name,
      this.address,
      this.city,
      this.postalCode,
      true,
    );
  }

}
