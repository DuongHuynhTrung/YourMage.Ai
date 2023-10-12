import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway {
  @WebSocketServer() server: Server;

  @SubscribeMessage('updateTokens')
  handleUpdateTokens(data: any) {
    this.server.emit('updateTokens', data);
  }
}
