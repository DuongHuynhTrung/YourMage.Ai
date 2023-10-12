import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

export class UpdateInterestsDto {
  @ApiProperty({
    description: 'Array of numbers user interests',
    example: [1, 2, 3, 4, 5],
    nullable: false,
  })
  @IsArray()
  @IsNotEmpty()
  interests: [number];
}
