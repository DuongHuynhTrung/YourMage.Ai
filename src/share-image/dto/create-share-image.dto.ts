import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { TypeEnum } from '../enum/type-enum';

export class CreateShareImageDto {
  @IsNotEmpty()
  @IsString()
  author: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  like: number;

  @IsNotEmpty()
  @IsString()
  details: string;

  @IsNotEmpty()
  @IsEnum(TypeEnum)
  type: TypeEnum;

  @IsNotEmpty()
  @IsBoolean()
  isLiked: boolean;

  @IsNotEmpty()
  @IsString()
  src: string;
}
