import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './entities/message.entity';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Message')
@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @ApiOperation({ summary: 'Create Message' })
  @ApiOkResponse({
    type: Message,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  @Post()
  createMessage(@Body() createMessageDto: CreateMessageDto): Promise<Message> {
    return this.messageService.createMessage(createMessageDto);
  }

  @ApiOperation({ summary: 'Get All Message' })
  @ApiOkResponse({
    type: [Message],
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  @Get('/:authorEmail')
  getAllMessages(
    @Param('authorEmail') authorEmail: string,
  ): Promise<Message[]> {
    return this.messageService.getAllMessages(authorEmail);
  }
}
