import { CreateMessageDto } from './src/message/dto/create-message.dto';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { MessageService } from 'src/message/message.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway {
  constructor(private readonly messageService: MessageService) {}

  @WebSocketServer() server: Server;

  @SubscribeMessage('updateTokens')
  handleUpdateTokens(data: any) {
    this.server.emit('updateTokens', data);
  }

  async handleMessage() {
    // Emit all existing messages to the new socket
    this.server.on('all_message', async (authorEmail) => {
      console.log(authorEmail.data.param);
      console.log(authorEmail);
      this.server.emit(
        'all_message',
        await this.messageService.getAllMessages(authorEmail),
      );
    });

    // Listen for new messages from the socket
    this.server.on('send_message', async (createMessageDto) => {
      // Create a new message object

      console.log(createMessageDto);

      // Save the message to MongoDB
      const message = await this.messageService.createMessage(createMessageDto);

      // Emit the new message to all connected sockets
      this.server.emit(
        'all_message',
        await this.messageService.getAllMessages(createMessageDto.authorEmail),
      );
    });
  }
}
