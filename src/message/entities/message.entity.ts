import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';
import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SenderEnum } from '../enum/sender-enum';

@Entity()
export class Message {
  @ApiProperty({
    description: 'Email of Author',
    example: 'trungduong22021619@gmail.com',
    nullable: false,
  })
  @ObjectIdColumn()
  _id: ObjectId;

  @ApiProperty({
    description: 'Email of Author',
    example: 'trungduong22021619@gmail.com',
    nullable: false,
  })
  @Column()
  authorEmail: string;

  @ApiProperty({
    description: 'Email of Author',
    example: 'trungduong22021619@gmail.com',
    nullable: false,
  })
  @Column()
  usernames: string;

  @ApiProperty({
    description: 'Email of Author',
    example: 'trungduong22021619@gmail.com',
    nullable: false,
  })
  @Column()
  senders: SenderEnum;

  @ApiProperty({
    description: 'Email of Author',
    example: 'trungduong22021619@gmail.com',
    nullable: false,
  })
  @Column()
  messageContent: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
