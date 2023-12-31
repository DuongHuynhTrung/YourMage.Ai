import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ShareImageService } from './share-image.service';
import { CreateShareImageDto } from './dto/create-share-image.dto';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/jwt.guard';
import { ShareImage } from './entities/share-image.entity';

@ApiTags('Share Image')
@Controller('shareImage')
export class ShareImageController {
  constructor(private readonly shareImageService: ShareImageService) {}

  @ApiOperation({ summary: 'Share Image' })
  @ApiOkResponse({
    description: 'Share Image Successfully.',
  })
  @ApiNotFoundResponse({
    description: 'Have No Share Images.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Post()
  shareImage(
    @Body() createShareImageDto: CreateShareImageDto,
  ): Promise<string> {
    return this.shareImageService.shareImage(createShareImageDto);
  }

  @ApiOperation({ summary: 'Get All Shared Image' })
  @ApiOkResponse({
    type: [ShareImage],
  })
  @ApiNotFoundResponse({
    description: 'Have No Share Images.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  @Get()
  getAll(): Promise<ShareImage[]> {
    return this.shareImageService.getAll();
  }
}
