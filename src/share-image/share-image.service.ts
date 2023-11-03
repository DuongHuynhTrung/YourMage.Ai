import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateShareImageDto } from './dto/create-share-image.dto';
import { Repository } from 'typeorm';
import { ShareImage } from './entities/share-image.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ShareImageService {
  constructor(
    @InjectRepository(ShareImage)
    private readonly shareImageRepository: Repository<ShareImage>,
  ) {}

  async shareImage(createShareImageDto: CreateShareImageDto): Promise<string> {
    let shareImages: ShareImage[] = null;
    try {
      shareImages = await this.shareImageRepository.find();
    } catch (error) {
      throw new NotFoundException('Have No Share Images');
    }
    if (shareImages.length < 5) {
      const data_project = shareImages.length;
      const shareImage = this.shareImageRepository.create();
      shareImage.data_project = data_project + 1;
      shareImage.list = [createShareImageDto];
      try {
        await this.shareImageRepository.save(shareImage);
      } catch (error) {
        throw new InternalServerErrorException(error.message);
      }
      return 'Share Image Successfully';
    } else {
      let length = 0;
      shareImages.map(async (shareImage: ShareImage) => {
        length += shareImage.list.length;
      });
      console.log(length);
      const data_project = (length % 5) + 1;
      shareImages.map(async (shareImage: ShareImage) => {
        if (shareImage.data_project === data_project) {
          shareImage.list.push(createShareImageDto);
          await this.shareImageRepository.save(shareImage);
        }
      });
    }
  }

  async getAll(): Promise<ShareImage[]> {
    try {
      const shareImages = await this.shareImageRepository.find();
      if (!shareImages || shareImages.length === 0) {
        throw new NotFoundException('Have No Share Images');
      }
      return shareImages;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
