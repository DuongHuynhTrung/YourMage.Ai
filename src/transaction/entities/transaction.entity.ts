import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';
import { LevelEnum } from 'src/user/enum/level.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Transaction {
  @ApiProperty({
    description: 'ObjectId as Transaction Id',
    example: new ObjectId('64aea612e3e3014d7e0431ce'),
  })
  @ObjectIdColumn()
  _id: ObjectId;

  @ApiProperty({
    description: 'Email of User',
    example: 'trungduong22021619@gmail.com',
    nullable: false,
  })
  @Column({ nullable: false, unique: true })
  email: string;

  @ApiProperty({
    description: 'Full Name of User',
    example: 'Huỳnh Dương',
    nullable: false,
  })
  @Column({ nullable: false })
  fullName: string;

  @ApiProperty({
    description: 'Phone Number of User',
    example: '0942859224',
  })
  @Column({ nullable: false })
  sđt: string;

  @ApiProperty({
    description: 'Level of User',
    example: LevelEnum.FREE,
    nullable: false,
  })
  @Column({ nullable: false })
  level: LevelEnum;

  @ApiProperty({
    description: 'Amount of money',
    example: 100000,
  })
  @Column({ nullable: false })
  amount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
