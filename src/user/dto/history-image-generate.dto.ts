import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class HistoryImageGenerateDto {
  @ApiProperty({
    description: 'Prompt used to generate',
    example: 'Hello',
    nullable: false,
  })
  @IsNotEmpty()
  @IsString()
  prompt: string;

  @ApiProperty({
    description: 'Array of images generated',
    example: ['Hello', 'World'],
    nullable: false,
  })
  @IsArray()
  @IsNotEmpty()
  imageGenerate: [string];

  @ApiProperty({
    description: 'The day image generated',
    example: '2023-10-25T16:55:21.167Z',
    nullable: false,
  })
  @IsDateString()
  @IsNotEmpty()
  createdAt: Date;
}
