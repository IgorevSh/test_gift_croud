import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { User } from '../database/models/user.model';
import { WishlistsService } from './wishlists.service';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt.guard';

@Controller('w')
export class PublicWishlistController {
  constructor(private wishlistsService: WishlistsService) {}

  @Get(':token')
  @UseGuards(OptionalJwtAuthGuard)
  async getByToken(
    @Param('token') token: string,
    @Req() req: Request & { user?: User },
  ) {
    const currentUserId = req.user?.id ?? null;
    const wishlist = await this.wishlistsService.findByShareToken(token);
    if (!wishlist) return { found: false };
    const isOwner = currentUserId === wishlist.ownerId;
    const view = await this.wishlistsService.getPublicViewByToken(token, isOwner, currentUserId);
    return { found: true, isOwner, wishlist: view };
  }
}
