import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ConfirmTransactionDto {
  @ApiProperty({
    description: 'ObjectId of the transaction',
    example: '6542244b15b901895ea42692',
    nullable: false,
  })
  @IsNotEmpty()
  transactionId: string;
}
