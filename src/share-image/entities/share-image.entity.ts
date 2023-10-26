import { ObjectId } from 'mongodb';
import { Column, Entity, ObjectIdColumn } from 'typeorm';
import { CreateShareImageDto } from '../dto/create-share-image.dto';

@Entity()
export class ShareImage {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  data_project: number;

  @Column()
  list: [CreateShareImageDto];
}
