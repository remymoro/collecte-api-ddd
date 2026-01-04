// src/domain/campaign-store-authorization/campaign-store-authorization.entity.ts

/**
 * 🎯 CONCEPT MÉTIER
 * ----------------
 * Cette entité représente un FAIT MÉTIER clair :
 *
 * 👉 « Ce magasin est-il autorisé à participer à cette campagne ? »
 *
 * Ce n’est :
 * - ni une simple table de jointure
 * - ni une décision technique
 *
 * C’est une DÉCISION ADMINISTRATIVE avec un cycle de vie.
 */

/**
 * Les statuts sont volontairement simples :
 * - ACTIVE   → le magasin peut participer
 * - INACTIVE → le magasin est exclu de la campagne
 *
 * ❌ Pas de dates ici
 * ❌ Pas de règles de campagne ici
 *
 * ➜ Cette entité répond à UNE question, pas plus.
 */
export type CampaignStoreAuthorizationStatus = 'ACTIVE' | 'INACTIVE';

export class CampaignStoreAuthorization {
  /**
   * 🚫 Constructeur PRIVÉ
   * --------------------
   * On empêche toute création libre avec `new`.
   *
   * Pourquoi ?
   * - éviter des états incohérents
   * - forcer une intention métier claire
   * - garantir que toute instance respecte les règles du domaine
   */
  private constructor(
    private readonly _id: string,
    private readonly _campaignId: string,
    private readonly _storeId: string,
    private _status: CampaignStoreAuthorizationStatus,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  // =========================
  // FACTORY — CRÉATION MÉTIER
  // =========================

  /**
   * 🏗️ Création d’une autorisation ACTIVE
   *
   * Lecture métier :
   * « L’admin autorise ce magasin pour cette campagne »
   *
   * 👉 Une autorisation NAÎT toujours ACTIVE.
   * 👉 Une autorisation INACTIVE n’a de sens qu’après coup.
   */
  static createActive(
    campaignId: string,
    storeId: string,
  ): CampaignStoreAuthorization {
    const now = new Date();

    return new CampaignStoreAuthorization(
      crypto.randomUUID(), // identité métier
      campaignId,
      storeId,
      'ACTIVE',
      now,
      now,
    );
  }

  // =========================
  // FACTORY — REHYDRATATION
  // =========================

  /**
   * 💧 Rehydratation = redonner vie à une entité
   *
   * La base de données ne renvoie que des DONNÉES.
   * Ces données ne savent RIEN faire.
   *
   * 👉 Cette méthode transforme des données persistées
   *    en une entité métier VIVANTE,
   *    capable d’appliquer ses règles.
   *
   * ⚠️ IMPORTANT :
   * - AUCUNE logique métier ici
   * - Juste une reconstruction fidèle de l’état
   */
  static rehydrate(props: {
    id: string;
    campaignId: string;
    storeId: string;
    status: CampaignStoreAuthorizationStatus;
    createdAt: Date;
    updatedAt: Date;
  }): CampaignStoreAuthorization {
    return new CampaignStoreAuthorization(
      props.id,
      props.campaignId,
      props.storeId,
      props.status,
      props.createdAt,
      props.updatedAt,
    );
  }

  // =========================
  // COMMANDES MÉTIER
  // =========================

  /**
   * 🔄 Activation
   *
   * Règle métier :
   * - Activer deux fois n’est PAS une erreur
   * - Le système doit être robuste aux doubles clics
   *
   * 👉 Cette méthode est volontairement idempotente
   */
  activate(): void {
    if (this._status === 'ACTIVE') {
      return;
    }

    this._status = 'ACTIVE';
    this._updatedAt = new Date();
  }

  /**
   * 🔄 Désactivation
   *
   * Même logique que l’activation :
   * - aucune exception inutile
   * - pas de bruit métier
   */
  deactivate(): void {
    if (this._status === 'INACTIVE') {
      return;
    }

    this._status = 'INACTIVE';
    this._updatedAt = new Date();
  }

  // =========================
  // GETTERS — API PUBLIQUE
  // =========================

  /**
   * 🔑 Identité métier
   */
  get id(): string {
    return this._id;
  }

  /**
   * 🧩 Référence de la campagne concernée
   *
   * 👉 L’entité NE CONNAÎT PAS Campaign
   * 👉 Elle connaît seulement son identifiant
   *
   * ➜ Découplage fort du domaine
   */
  get campaignId(): string {
    return this._campaignId;
  }

  /**
   * 🧩 Référence du magasin concerné
   *
   * Même principe que campaignId
   */
  get storeId(): string {
    return this._storeId;
  }

  /**
   * 📌 État courant de l’autorisation
   */
  get status(): CampaignStoreAuthorizationStatus {
    return this._status;
  }

  /**
   * ❓ Question métier simple
   *
   * Lecture naturelle :
   * « Ce magasin est-il autorisé ? »
   */
  get isActive(): boolean {
    return this._status === 'ACTIVE';
  }

  /**
   * 🕒 Audit
   *
   * Utile pour :
   * - debug
   * - traçabilité
   * - conformité
   */
  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
