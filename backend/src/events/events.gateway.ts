import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: { origin: true },
  namespace: '/',
})
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('joinWishlist')
  handleJoinWishlist(
    @MessageBody() data: { shareToken: string },
    @ConnectedSocket() client: { join: (room: string) => void },
  ) {
    if (data?.shareToken && client?.join) {
      client.join(`wishlist:${data.shareToken}`);
    }
  }

  emitWishlistUpdate(shareToken: string, payload: { type: string; data?: unknown }) {
    this.server?.to(`wishlist:${shareToken}`).emit('wishlistUpdate', payload);
  }
}
