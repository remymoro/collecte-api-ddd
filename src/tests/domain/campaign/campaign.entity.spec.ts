import { Campaign } from '@domain/campaign/campaign.entity';
import { CampaignStatus } from '@domain/campaign/enums/campaign-status.enum';
import { InvalidCampaignPeriodError } from '@domain/campaign/errors/invalid-campaign-period.error';
import { CampaignCannotBeModifiedError } from '@domain/campaign/errors/campaign-cannot-be-modified.error';
import { CannotCancelClosedCampaignError } from '@domain/campaign/errors/cannot-cancel-closed-campaign.error';

const utcDate = (year: number, month: number, day: number): Date =>
  new Date(Date.UTC(year, month - 1, day, 0, 0, 0));

describe('Campaign (Invariants métier)', () => {
  it('une campagne a une période valide (start < end)', () => {
    expect(() =>
      Campaign.create(
        'Campagne 2026',
        2026,
        utcDate(2026, 3, 10),
        utcDate(2026, 3, 9),
        5,
        'user-1',
      ),
    ).toThrow(InvalidCampaignPeriodError);
  });

  it('une campagne ne peut pas chevaucher une année existante', () => {
    expect(() =>
      Campaign.create(
        'Campagne 2026',
        2026,
        utcDate(2025, 12, 31),
        utcDate(2026, 1, 2),
        5,
        'user-1',
      ),
    ).toThrow(InvalidCampaignPeriodError);
  });

  it('une campagne planifiée peut être activée', () => {
    const campaign = Campaign.create(
      'Campagne 2026',
      2026,
      utcDate(2026, 3, 1),
      utcDate(2026, 3, 10),
      5,
      'user-1',
    );

    expect(campaign.status).toBe(CampaignStatus.PLANIFIEE);

    campaign.start();

    expect(campaign.status).toBe(CampaignStatus.EN_COURS);
  });

  it('une campagne active peut être clôturée', () => {
    const campaign = Campaign.create(
      'Campagne 2026',
      2026,
      utcDate(2026, 3, 1),
      utcDate(2026, 3, 10),
      5,
      'user-1',
    );

    campaign.start();
    campaign.close('admin-1');

    expect(campaign.status).toBe(CampaignStatus.CLOTUREE);
    expect(campaign.closedBy).toBe('admin-1');
    expect(campaign.closedAt).toBeInstanceOf(Date);
  });

  it('une campagne clôturée ne peut plus être modifiée', () => {
    const campaign = Campaign.create(
      'Campagne 2026',
      2026,
      utcDate(2026, 3, 1),
      utcDate(2026, 3, 10),
      5,
      'user-1',
    );

    campaign.start();
    campaign.close('admin-1');

    expect(() =>
      campaign.updateInfo(
        'Nouveau nom',
        utcDate(2026, 3, 2),
        utcDate(2026, 3, 11),
        utcDate(2026, 3, 16),
      ),
    ).toThrow(CampaignCannotBeModifiedError);
  });

  it('une campagne refuse les saisies hors période', () => {
    const campaign = Campaign.create(
      'Campagne 2026',
      2026,
      utcDate(2026, 3, 1),
      utcDate(2026, 3, 10),
      5,
      'user-1',
    );

    campaign.start();
    campaign.complete();

    const afterGrace = utcDate(2026, 3, 16);

    expect(campaign.canAcceptEntries(afterGrace)).toBe(false);
  });

  it('une campagne accepte les saisies pendant la période de grâce', () => {
    const campaign = Campaign.create(
      'Campagne 2026',
      2026,
      utcDate(2026, 3, 1),
      utcDate(2026, 3, 10),
      5,
      'user-1',
    );

    campaign.start();
    campaign.complete();

    const inGrace = utcDate(2026, 3, 12);

    expect(campaign.status).toBe(CampaignStatus.TERMINEE);
    expect(campaign.canAcceptEntries(inGrace)).toBe(true);
  });

  it('annuler une campagne clôturée est interdit', () => {
    const campaign = Campaign.create(
      'Campagne 2026',
      2026,
      utcDate(2026, 3, 1),
      utcDate(2026, 3, 10),
      5,
      'user-1',
    );

    campaign.start();
    campaign.close('admin-1');

    expect(() => campaign.cancel()).toThrow(CannotCancelClosedCampaignError);
  });
});
