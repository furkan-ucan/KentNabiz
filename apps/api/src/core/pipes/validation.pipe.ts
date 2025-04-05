import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { ClassConstructor } from 'class-transformer/types/interfaces';

type ValidatorMetatype = ClassConstructor<unknown>;

@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(value: unknown, { metatype }: ArgumentMetadata): Promise<unknown> {
    if (!metatype || !this.toValidate(metatype as ValidatorMetatype)) {
      return value;
    }

    const object = plainToClass(metatype as ValidatorMetatype, value);
    const errors = await validate(object as object);

    if (errors.length > 0) {
      throw new BadRequestException('Validation failed', {
        cause: errors,
        description: this.formatErrors(errors),
      });
    }

    return object;
  }

  private formatErrors(errors: ValidationError[]): string {
    return errors
      .map(err => {
        if (err.constraints) {
          return Object.values(err.constraints).join(', ');
        }
        return 'Invalid value';
      })
      .join('; ');
  }

  private toValidate(metatype: ValidatorMetatype): boolean {
    const types: ValidatorMetatype[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
