import {
  Entity,
  Column,
  ObjectIdColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ObjectId } from 'mongodb';
import { ApiProperty } from '@nestjs/swagger';
import { LevelEnum } from '../enum/level.enum';
import { RoleEnum } from '../enum/role.enum';

@Entity()
export class User {
  @ApiProperty({
    description: 'ObjectId as User Id',
    example: new ObjectId('64aea612e3e3014d7e0431ce'),
  })
  @ObjectIdColumn()
  _id: ObjectId;

  @ApiProperty({
    description: 'UserName of User',
    example: 'DuongHuynh02',
    nullable: false,
  })
  @Column()
  userName: string;

  @ApiProperty({
    description: 'Email of User',
    example: 'trungduong22021619@gmail.com',
    nullable: false,
  })
  @Column({ nullable: false, unique: true })
  email: string;

  @ApiProperty({
    description: 'Password of User',
    example: '123456',
    nullable: false,
  })
  @Column({ nullable: false })
  password: string;

  @ApiProperty({
    description: 'List of users interested',
    example: '[1,4,2,6,7]',
    nullable: false,
  })
  @Column()
  interests: [number];

  @ApiProperty({
    description: 'Is User Older than 18',
    example: true,
  })
  @Column({ nullable: false, default: false })
  isOlder18: boolean;

  @ApiProperty({
    description: 'Level of User',
    example: LevelEnum.FREE,
    nullable: false,
  })
  @Column({ nullable: false, default: LevelEnum.FREE })
  level: LevelEnum;

  @ApiProperty({
    description: 'Numbers of tokens',
    example: 150,
    nullable: false,
  })
  @Column({ nullable: false, default: 150 })
  tokens: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({
    description: 'The Date User Upgraded Level',
    example: '20/10/2023',
  })
  @Column()
  upgradeLevelAt: Date;

  @ApiProperty({
    description: 'Role of User',
    example: 'Admin',
  })
  @Column()
  role: RoleEnum;

  @ApiProperty({
    description: 'Status of account',
    example: 'true',
    default: false,
  })
  @Column({ nullable: false, default: false })
  status: boolean;
}
