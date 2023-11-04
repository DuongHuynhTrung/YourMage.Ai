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
    this.server.on('all_message', async (getAllMessageDto: string) => {
      this.server.emit(
        'all_message',
        await this.messageService.getAllMessages(getAllMessageDto),
      );
    });

    // Listen for new messages from the socket
    this.server.on(
      'send_message',
      async (createMessageDto: CreateMessageDto) => {
        // Create a new message object

        // Save the message to MongoDB
        const message =
          await this.messageService.createMessage(createMessageDto);

        // Emit the new message to all connected sockets
        this.server.emit('send_message', message);
      },
    );
  }
}
