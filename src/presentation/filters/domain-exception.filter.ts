import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { DomainError } from '../../domain/errors/domain-error';

@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(error: DomainError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    switch (error.code) {
      case 'ENTRY_NOT_FOUND':
        response
          .status(HttpStatus.NOT_FOUND)
          .json({ error: error.code, message: error.message });
        break;

      case 'ENTRY_EMPTY':
        response
          .status(HttpStatus.UNPROCESSABLE_ENTITY)
          .json({ error: error.code, message: error.message });
        break;

      case 'ENTRY_ALREADY_VALIDATED':
        response
          .status(HttpStatus.CONFLICT)
          .json({ error: error.code, message: error.message });
        break;

      case 'PRODUCT_NOT_FOUND':
        response
          .status(HttpStatus.NOT_FOUND)
          .json({ error: error.code, message: error.message });
        break;

            case 'PRODUCT_ALREADY_EXISTS': // ✅ AJOUT
        response
          .status(HttpStatus.CONFLICT)
          .json({ error: error.code, message: error.message });
        break;
        case 'PRODUCT_ARCHIVED':
            response
              .status(HttpStatus.CONFLICT)
              .json({ error: error.code, message: error.message });
            break;


      default:
        response
          .status(HttpStatus.BAD_REQUEST)
          .json({ error: error.code, message: error.message });
    }
  }
}
