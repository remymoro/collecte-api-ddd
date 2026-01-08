// src/domain/campaign/campaign.entity.spec.ts

import { Campaign } from './campaign.entity';
import { CampaignStatus } from './enums/campaign-status.enum';
import { InvalidCampaignPeriodError } from './errors/invalid-campaign-period.error';
import { CannotCloseCampaignError } from './errors/cannot-close-campaign.error';

describe('Campaign Entity', () => {
  const validUserId = '550e8400-e29b-41d4-a716-446655440000';

  describe('Règle métier : Validation des dates', () => {
    it('refuse une campagne qui se termine avant de commencer', () => {
      // POURQUOI : Incohérence temporelle métier
      const startDate = new Date('2026-06-01');
      const endDate = new Date('2026-05-01'); // AVANT startDate ❌

      expect(() =>
        Campaign.create(
          'Campagne Test',
          2026,
          startDate,
          endDate,
          7, // gracePeriodDays
          validUserId,
        ),
      ).toThrow(InvalidCampaignPeriodError);
    });

    it('refuse une campagne de moins d\'1 jour', () => {
      // POURQUOI : Une campagne doit avoir une durée minimale
      const startDate = new Date('2026-06-01T09:00:00');
      const endDate = new Date('2026-06-01T10:00:00'); // 1 heure ❌

      expect(() =>
        Campaign.create('Campagne Test', 2026, startDate, endDate, 7, validUserId),
      ).toThrow(/must last at least 1 day/);
    });

    it('refuse une campagne dont les dates ne correspondent pas à l\'année', () => {
      // POURQUOI : Intégrité métier (year = 2026, mais dates en 2025) ❌
      const startDate = new Date('2025-06-01');
      const endDate = new Date('2025-12-31');

      expect(() =>
        Campaign.create('Campagne Test', 2026, startDate, endDate, 7, validUserId),
      ).toThrow(/must start and end within the same year/);
    });

    it('accepte une campagne valide avec grace period', () => {
      // POURQUOI : Scénario nominal métier
      const startDate = new Date('2026-06-01');
      const endDate = new Date('2026-12-31');

      const campaign = Campaign.create(
        'Campagne 2026',
        2026,
        startDate,
        endDate,
        7, // 7 jours de grace period
        validUserId,
      );

      expect(campaign.year).toBe(2026);
      expect(campaign.status).toBe(CampaignStatus.PLANIFIEE);
    });
  });

  describe('Règle métier : canAcceptEntries (grace period)', () => {
    it('refuse les saisies pendant la période officielle si statut PLANIFIEE', () => {
      // POURQUOI : Une campagne planifiée n'accepte pas encore de saisies
      const campaign = Campaign.create(
        'Campagne 2026',
        2026,
        new Date('2026-06-01'),
        new Date('2026-12-31'),
        7,
        validUserId,
      );

      const duringOfficialPeriod = new Date('2026-08-15');
      expect(campaign.canAcceptEntries(duringOfficialPeriod)).toBe(false);
    });

    it('accepte les saisies pendant la période officielle si EN_COURS', () => {
      // POURQUOI : C'est l'usage normal de la campagne
      const campaign = Campaign.create(
        'Campagne 2026',
        2026,
        new Date('2026-06-01'),
        new Date('2026-12-31'),
        7,
        validUserId,
      );

      campaign.start();
      const duringOfficialPeriod = new Date('2026-08-15');
      expect(campaign.canAcceptEntries(duringOfficialPeriod)).toBe(true);
    });

    it('accepte les saisies pendant la grace period si TERMINEE', () => {
      // POURQUOI : Règle métier critique : on laisse 7 jours après la fin
      const campaign = Campaign.create(
        'Campagne 2026',
        2026,
        new Date('2026-06-01'),
        new Date('2026-12-31'),
        7, // grace period de 7 jours
        validUserId,
      );

      campaign.start();
      campaign.complete();
      // Simuler fin de campagne (TERMINEE)
      const inGracePeriod = new Date('2027-01-03'); // 3 jours après fin
      expect(campaign.canAcceptEntries(inGracePeriod)).toBe(true);
    });

    it('refuse les saisies après la grace period', () => {
      // POURQUOI : Au-delà du délai, la campagne est définitivement fermée
      const campaign = Campaign.create(
        'Campagne 2026',
        2026,
        new Date('2026-06-01'),
        new Date('2026-12-31'),
        7,
        validUserId,
      );

      campaign.start();
      campaign.complete();
      const afterGracePeriod = new Date('2027-01-10'); // 10 jours après fin ❌
      expect(campaign.canAcceptEntries(afterGracePeriod)).toBe(false);
    });

    it('refuse les saisies si la campagne est CLOTUREE', () => {
      // POURQUOI : Une campagne clôturée n'accepte plus de modifications
      const campaign = Campaign.create(
        'Campagne 2026',
        2026,
        new Date('2026-06-01'),
        new Date('2026-12-31'),
        7,
        validUserId,
      );

      campaign.start();
      campaign.close(validUserId);

      const duringOfficialPeriod = new Date('2026-08-15');
      expect(campaign.canAcceptEntries(duringOfficialPeriod)).toBe(false);
    });
  });

  describe('Règle métier : Transitions de statut', () => {
    it('refuse de clôturer une campagne PLANIFIEE', () => {
      // POURQUOI : On ne peut pas clôturer ce qui n'a pas encore commencé
      const campaign = Campaign.create(
        'Campagne 2026',
        2026,
        new Date('2026-06-01'),
        new Date('2026-12-31'),
        7,
        validUserId,
      );

      expect(() => campaign.close(validUserId)).toThrow(CannotCloseCampaignError);
    });

    it('permet de clôturer une campagne EN_COURS', () => {
      // POURQUOI : Clôture anticipée autorisée
      const campaign = Campaign.create(
        'Campagne 2026',
        2026,
        new Date('2026-06-01'),
        new Date('2026-12-31'),
        7,
        validUserId,
      );


      campaign.start();
      campaign.close(validUserId);

      expect(campaign.status).toBe(CampaignStatus.CLOTUREE);
      expect(campaign.closedBy).toBe(validUserId);
      expect(campaign.closedAt).toBeInstanceOf(Date);
    });
  });
});
