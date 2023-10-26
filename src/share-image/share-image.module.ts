import { Module } from '@nestjs/common';
import { ShareImageService } from './share-image.service';
import { ShareImageController } from './share-image.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShareImage } from './entities/share-image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShareImage])],
  controllers: [ShareImageController],
  providers: [ShareImageService],
})
export class ShareImageModule {}
