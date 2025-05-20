// apps/api/src/core/filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

// ValidationPipe'tan gelen hata yanıtının olası yapısı için bir arayüz
interface ValidationExceptionResponse {
  statusCode: number;
  message: string[] | string; // Mesaj bir dizi (detaylı) veya tek bir string olabilir
  error: string;
}

// Diğer HttpException yanıtları için genel bir arayüz
interface GenericHttpExceptionResponse {
  statusCode: number;
  message: string;
  error?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: HttpStatus;
    let messageDetail: string | string[]; // Detaylı hata mesajlarını tutacak
    let errorTitle: string | undefined; // "Bad Request", "Unauthorized" gibi genel başlık

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse(); // Bu any dönebilir
      errorTitle = exception.constructor.name;

      this.logger.debug(
        `HttpException caught. Status: ${status}, Name: ${errorTitle}, Raw Response: ${JSON.stringify(exceptionResponse)}`,
        HttpExceptionFilter.name
      );

      // Tip kontrolü yaparak exceptionResponse'u daraltalım
      if (
        status === HttpStatus.BAD_REQUEST &&
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const validationResponse = exceptionResponse as ValidationExceptionResponse;
        if (Array.isArray(validationResponse.message)) {
          messageDetail = validationResponse.message; // ["hata1", "hata2"]
        } else if (
          typeof validationResponse.error === 'string' &&
          validationResponse.message === 'Validation failed'
        ) {
          // Sizin logunuzdaki durum: {"message":"Validation failed","error":"Invalid value..."}
          messageDetail = validationResponse.error;
        } else if (typeof validationResponse.message === 'string') {
          messageDetail = validationResponse.message;
        } else {
          messageDetail = 'Validation failed but details are unclear.';
        }
      } else if (typeof exceptionResponse === 'string') {
        messageDetail = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        'message' in exceptionResponse &&
        typeof (exceptionResponse as GenericHttpExceptionResponse).message === 'string'
      ) {
        messageDetail = (exceptionResponse as GenericHttpExceptionResponse).message;
      } else {
        messageDetail = exception.message || 'An Http error occurred';
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      messageDetail = 'Internal server error';
      errorTitle = exception instanceof Error ? exception.constructor.name : 'UnknownError';
    }

    const responsePayload = {
      statusCode: status,
      message: messageDetail,
      error: errorTitle,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    this.logger.error(
      `HTTP Status: ${status} Final Response Payload: ${JSON.stringify(responsePayload)} Path: ${request.url} Method: ${request.method}`,
      exception instanceof Error ? exception.stack : undefined,
      HttpExceptionFilter.name
    );

    response.status(status).json(responsePayload);
  }
}
