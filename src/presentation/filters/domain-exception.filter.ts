import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { DomainError } from '@domain/errors/domain-error';
import { DOMAIN_ERROR_HTTP_MAP } from './domain-error.http-map';

@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(error: DomainError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    const status =
      DOMAIN_ERROR_HTTP_MAP[error.code] ??
      HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json({
      error: error.code,
      message: error.message,
    });
  }
}
