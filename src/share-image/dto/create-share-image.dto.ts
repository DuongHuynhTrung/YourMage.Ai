import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { TypeEnum } from '../enum/type-enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateShareImageDto {
  @ApiProperty({
    description: 'Author of Image',
    example: 'Dương Huỳnh',
    nullable: false,
  })
  @IsNotEmpty()
  @IsString()
  author: string;

  @ApiProperty({
    description: 'Name of Image',
    example: 'Abc',
    nullable: false,
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Number like of Image',
    example: 123,
    nullable: false,
  })
  @IsNotEmpty()
  @IsNumber()
  like: number;

  @ApiProperty({
    description: 'Details of Image',
    example: 'abc',
    nullable: false,
  })
  @IsNotEmpty()
  @IsString()
  details: string;

  @ApiProperty({
    description: 'Type of Image',
    example: TypeEnum.NEW,
    nullable: false,
  })
  @IsNotEmpty()
  @IsEnum(TypeEnum)
  type: TypeEnum;

  @ApiProperty({
    description: 'Is User Like of Image',
    example: false,
    nullable: false,
  })
  @IsNotEmpty()
  @IsBoolean()
  isLiked: boolean;

  @ApiProperty({
    description: 'Src of Image',
    example: 'abc',
    nullable: false,
  })
  @IsNotEmpty()
  @IsString()
  src: string;
}
