import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  StreamableFile,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import { ResponseDto } from '../../common/dto/response.dto';
import { PaginatedResponse } from '../../common/dto/paginated-response.dto';

@Injectable()
export class TransformInterceptor<T = unknown> implements NestInterceptor<T, ResponseDto<T> | T> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ResponseDto<T> | T> {
    const res = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((data: T): ResponseDto<T> | T => {
        // 204 veya body yoksa dokunma
        if (res.statusCode === 204 || data === null || data === undefined) {
          return data;
        }

        // Zaten ResponseDto, PaginatedResponse ya da akış (dosya) ise dokunma
        if (
          data instanceof ResponseDto ||
          data instanceof PaginatedResponse ||
          data instanceof StreamableFile
        ) {
          return data;
        }

        // Buraya kadar geldiysek **dış** sarmala ihtiyaç var
        return new ResponseDto(data);
      })
    );
  }
}
