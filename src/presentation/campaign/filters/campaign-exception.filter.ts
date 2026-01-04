import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { DomainError } from '@domain/errors/domain-error';
import { DOMAIN_ERROR_HTTP_MAP } from '@presentation/filters/domain-error.http-map';
import { CampaignValidationError } from '@domain/campaign/errors/campaign-validation.error';
import { PersistenceError } from '@domain/errors/persistence.error';

type ErrorResponseBody = {
  code: string;
  message: string;
  details?: unknown;
};

function asValidationDetails(exception: BadRequestException): unknown {
  const response = exception.getResponse();

  if (typeof response === 'object' && response) {
    const anyResponse = response as any;
    if (Array.isArray(anyResponse.message)) {
      return {
        issues: anyResponse.message,
      };
    }
    return { response };
  }

  return { response };
}

@Catch()
export class CampaignExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const response = http.getResponse();

    // 1) Validation errors (class-validator / ValidationPipe)
    if (exception instanceof BadRequestException) {
      const err = new CampaignValidationError(
        'Invalid campaign request payload',
        asValidationDetails(exception),
      );

      const body: ErrorResponseBody = {
        code: err.code,
        message: err.message,
        details: err.details,
      };

      return response.status(HttpStatus.BAD_REQUEST).json(body);
    }

    // 2) Domain errors (business rules)
    if (exception instanceof DomainError) {
      // Never expose PERSISTENCE_ERROR on Campaign endpoints
      if (exception instanceof PersistenceError) {
        const body: ErrorResponseBody = {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Internal server error',
        };
        return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(body);
      }

      const status =
        DOMAIN_ERROR_HTTP_MAP[exception.code] ?? HttpStatus.INTERNAL_SERVER_ERROR;

      const body: ErrorResponseBody = {
        code: exception.code,
        message: exception.message,
        ...(exception.details !== undefined ? { details: exception.details } : {}),
      };

      return response.status(status).json(body);
    }

    // 3) Other HTTP exceptions
    if (exception instanceof HttpException) {
      const status = exception.getStatus();

      const body: ErrorResponseBody = {
        code: 'HTTP_ERROR',
        message: exception.message,
        details: exception.getResponse(),
      };

      return response.status(status).json(body);
    }

    // 4) Unknown errors
    const body: ErrorResponseBody = {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
    };

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(body);
  }
}
