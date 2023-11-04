import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { SenderEnum } from '../enum/sender-enum';

export class CreateMessageDto {
  @ApiProperty({
    description: 'Email of Author',
    example: 'trungduong22021619@gmail.com',
    nullable: false,
  })
  @IsNotEmpty()
  @IsEmail()
  authorEmail: string;

  @ApiProperty({
    description: 'UserName ',
    example: 'Dương Huỳnh',
    nullable: false,
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: 'Sender',
    example: 'user',
    nullable: false,
  })
  @IsNotEmpty()
  @IsEnum(SenderEnum)
  senders: SenderEnum;

  @ApiProperty({
    description: 'Message Content',
    example: 'Hello world :)',
    nullable: false,
  })
  @IsNotEmpty()
  @IsString()
  messageContent: string;
}
