import { GetAllMessageDto } from './dto/get-all-message.dto';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async createMessage(createMessageDto: CreateMessageDto): Promise<Message> {
    try {
      const message = await this.messageRepository.save(createMessageDto);
      return message;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAllMessages(getAllMessageDto: GetAllMessageDto): Promise<Message[]> {
    try {
      return await this.messageRepository.find({
        where: {
          authorEmail: getAllMessageDto.authorEmail,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
