import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { EventsModule } from '../events/events.module';
import { AuthModule } from '../auth/auth.module';
import { WishlistsService } from './wishlists.service';
import { WishlistsController } from './wishlists.controller';
import { PublicWishlistController } from './public-wishlist.controller';

@Module({
  imports: [DatabaseModule, EventsModule, AuthModule],
  providers: [WishlistsService],
  controllers: [WishlistsController, PublicWishlistController],
  exports: [WishlistsService],
})
export class WishlistsModule {}
