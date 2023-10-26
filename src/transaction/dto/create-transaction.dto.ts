import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { LevelEnum } from 'src/user/enum/level.enum';
import { ConstantPaymentEnum } from '../enum/constant-payment.enum';

export class CreateTransactionDto {
  @ApiProperty({
    description: 'Email of User',
    example: 'trungduong22021619@gmail.com',
    nullable: false,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Full Name of User',
    example: 'Huỳnh Dương',
    nullable: false,
  })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({
    description: 'Phone Number of User',
    example: '0942859224',
  })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiProperty({
    description: 'Level of User',
    example: LevelEnum.FREE,
    nullable: false,
  })
  @IsNotEmpty()
  @IsEnum(LevelEnum)
  level: LevelEnum;

  @ApiProperty({
    description: 'Constant Payment',
    example: ConstantPaymentEnum.MONTHLY,
  })
  @IsNotEmpty()
  @IsEnum(ConstantPaymentEnum)
  constantPayment: ConstantPaymentEnum;

  @ApiProperty({
    description: 'Amount of money',
    example: 100000,
  })
  @IsNotEmpty()
  @IsNumber()
  amount: number;
}
