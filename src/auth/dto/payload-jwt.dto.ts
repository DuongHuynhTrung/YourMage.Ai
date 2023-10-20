import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { LevelEnum } from 'src/user/enum/level.enum';
import { RoleEnum } from 'src/user/enum/role.enum';
export class PayloadJwtDto {
  @IsString()
  @IsNotEmpty()
  userName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsEnum(LevelEnum)
  level: LevelEnum;

  @IsNotEmpty()
  @IsArray()
  interests: [number];

  @IsNotEmpty()
  @IsBoolean()
  isOlder18: boolean;

  @IsNotEmpty()
  @IsNumber()
  tokens: number;

  @IsNotEmpty()
  @IsBoolean()
  status: boolean;

  @IsNotEmpty()
  @IsEnum(RoleEnum)
  role: RoleEnum;

  @IsBoolean()
  isNewUser: boolean;
}
