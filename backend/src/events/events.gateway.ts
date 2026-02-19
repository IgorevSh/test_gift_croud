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

  /** Join room for a wishlist by share token to receive real-time updates */
  @SubscribeMessage('joinWishlist')
  handleJoinWishlist(
    @MessageBody() data: { shareToken: string },
    @ConnectedSocket() client: { join: (room: string) => void },
  ) {
    if (data?.shareToken && client?.join) {
      client.join(`wishlist:${data.shareToken}`);
    }
  }

  /** Broadcast wishlist update to all viewers of this list (owner and guests). */
  emitWishlistUpdate(shareToken: string, payload: { type: string; data?: any }) {
    this.server?.to(`wishlist:${shareToken}`).emit('wishlistUpdate', payload);
  }
}
