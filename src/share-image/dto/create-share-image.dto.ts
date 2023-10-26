import { IsNotEmpty } from 'class-validator';

export class CreateShareImageDto {
  @IsNotEmpty()
  author: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  like: number;

  @IsNotEmpty()
  details: string;

  @IsNotEmpty()
  src: string;
}
