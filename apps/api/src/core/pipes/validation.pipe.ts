// apps/api/src/core/pipes/validation.pipe.ts (GÜVENLİ VE GÜNCELLENMİŞ HALİ)

import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  ValidationError,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { ClassConstructor } from 'class-transformer/types/interfaces';

@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(value: unknown, { metatype }: ArgumentMetadata): Promise<unknown> {
    if (!metatype || !this.toValidate(metatype as ClassConstructor<unknown>)) {
      return value;
    }

    const object = plainToClass(metatype as ClassConstructor<unknown>, value);

    // NOT: Mevcut kodunda olmayan `validate` seçeneklerini (whitelist vb.) ŞİMDİLİK eklemiyoruz.
    // Bu, web uygulamasının bozulmasını engeller.
    const errors = await validate(object as object);

    if (errors.length > 0) {
      // *** TEK DEĞİŞİKLİK BURADA ***
      // Hata mesajlarını reküresif olarak formatlayıp `message` alanına koyuyoruz.
      const formattedErrors = this.flattenErrors(errors);
      throw new BadRequestException(formattedErrors);
    }

    return object; // Mevcut kodun gibi 'object' döndürmeye devam edelim.
  }

  // Bu metot, hataları ['alan: hata mesajı', 'nesne.alan: hata mesajı'] formatında bir diziye çevirir.
  private flattenErrors(validationErrors: ValidationError[], parentPath = ''): string[] {
    const errors: string[] = [];
    for (const error of validationErrors) {
      const propertyPath = parentPath ? `${parentPath}.${error.property}` : error.property;

      if (error.constraints) {
        for (const key in error.constraints) {
          errors.push(`${propertyPath}: ${error.constraints[key]}`);
        }
      }

      if (error.children && error.children.length > 0) {
        errors.push(...this.flattenErrors(error.children, propertyPath));
      }
    }
    return errors;
  }

  private toValidate(metatype: ClassConstructor<unknown>): boolean {
    const types: ClassConstructor<unknown>[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
