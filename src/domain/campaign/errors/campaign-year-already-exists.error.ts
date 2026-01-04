import { DomainError } from '@domain/errors/domain-error';

export class CampaignYearAlreadyExistsError extends DomainError {
  readonly code = 'CAMPAIGN_YEAR_ALREADY_EXISTS';

  constructor(year: number) {
    super(`Campaign for year ${year} already exists`, { year });
  }
}
