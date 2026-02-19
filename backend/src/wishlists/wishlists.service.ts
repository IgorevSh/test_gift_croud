import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../database/models/user.model';
import { Wishlist } from '../database/models/wishlist.model';
import { WishlistItem } from '../database/models/wishlist-item.model';
import { Reservation } from '../database/models/reservation.model';
import { Contribution } from '../database/models/contribution.model';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectModel(Wishlist) private wishlistModel: typeof Wishlist,
    @InjectModel(WishlistItem) private itemModel: typeof WishlistItem,
    @InjectModel(Reservation) private reservationModel: typeof Reservation,
    @InjectModel(Contribution) private contributionModel: typeof Contribution,
    private eventsGateway: EventsGateway,
  ) {}

  private generateShareToken(): string {
    return uuidv4().replace(/-/g, '').slice(0, 16);
  }

  async create(ownerId: string, title: string, description?: string): Promise<Wishlist> {
    let shareToken = this.generateShareToken();
    while (await this.wishlistModel.findOne({ where: { shareToken } })) {
      shareToken = this.generateShareToken();
    }
    return this.wishlistModel.create({
      ownerId,
      title,
      description: description || null,
      shareToken,
    });
  }

  async findMy(ownerId: string): Promise<Wishlist[]> {
    return this.wishlistModel.findAll({
      where: { ownerId },
      order: [['updatedAt', 'DESC']],
      include: [
        {
          model: WishlistItem,
          as: 'items',
          required: false,
          order: [['sortOrder', 'ASC']],
        },
      ],
    });
  }

  async findOne(id: string, ownerId: string): Promise<Wishlist> {
    const w = await this.wishlistModel.findOne({
      where: { id, ownerId },
      include: [{ model: WishlistItem, as: 'items', order: [['sortOrder', 'ASC']] }],
    });
    if (!w) throw new NotFoundException('Wishlist not found');
    return w;
  }

  async findByShareToken(token: string): Promise<Wishlist | null> {
    return this.wishlistModel.findOne({
      where: { shareToken: token },
      include: [
        { model: User, as: 'owner', attributes: ['displayName'], required: false },
        {
          model: WishlistItem,
          as: 'items',
          required: false,
          order: [['sortOrder', 'ASC']],
          include: [
            {
              model: Reservation,
              as: 'reservation',
              required: false,
              include: [{ model: User, attributes: ['displayName'], required: false }],
            },
            {
              model: Contribution,
              as: 'contributions',
              required: false,
              include: [{ model: User, as: 'user', attributes: ['id', 'displayName'], required: false }],
            },
          ],
        },
      ],
    });
  }

  /** For owner: items with isReserved + contributedTotal only. For guest: items with reservation/contributions + isCurrentUser for reservation. */
  async getPublicViewByToken(token: string, isOwner: boolean, currentUserId?: string | null): Promise<Wishlist | null> {
    const w = await this.findByShareToken(token);
    if (!w) return null;
    const plain = w.get({ plain: true }) as any;
    const ownerDisplayName = plain.owner?.displayName ?? 'Автор';
    delete plain.owner;
    plain.ownerDisplayName = ownerDisplayName;
    plain.items = (plain.items || []).map((item: any) => {
      const { reservation, contributions, ...rest } = item;
      if (isOwner) {
        return {
          ...rest,
          isReserved: !!reservation,
          contributedTotal: (contributions || []).reduce(
            (s: number, c: any) => s + parseFloat(c.amount || 0),
            0,
          ),
        };
      }
      const contribList = (contributions || []).map((c: any) => ({
        id: c.id,
        amount: c.amount,
        userId: c.userId ?? c.user_id,
        displayName: c.user?.displayName ?? 'Участник',
      }));
      const myContrib =
        currentUserId &&
        contribList.find((c: any) => String(c.userId) === String(currentUserId));
      return {
        ...rest,
        isReserved: !!reservation,
        reservation: reservation
          ? {
              id: reservation.id,
              isCurrentUser:
                !!currentUserId &&
                (String((reservation as any).userId ?? (reservation as any).user_id) === String(currentUserId)),
              displayName: (reservation as any).user?.displayName ?? (reservation as any).User?.displayName ?? 'Участник',
            }
          : null,
        contributedTotal: (contributions || []).reduce(
          (s: number, c: any) => s + parseFloat(c.amount || 0),
          0,
        ),
        contributions: contribList,
        myContribution: myContrib ? { id: myContrib.id, amount: myContrib.amount } : null,
      };
    });
    return plain as Wishlist;
  }

  async update(id: string, ownerId: string, data: { title?: string; description?: string }): Promise<Wishlist> {
    const w = await this.findOne(id, ownerId);
    await w.update(data);
    this.eventsGateway.emitWishlistUpdate(w.shareToken, { type: 'wishlist' });
    return w;
  }

  async remove(id: string, ownerId: string): Promise<void> {
    const w = await this.findOne(id, ownerId);
    await w.destroy();
  }

  async addItem(
    wishlistId: string,
    ownerId: string,
    data: {
      title: string;
      link?: string | null;
      price?: string | null;
      currency?: string | null;
      targetAmount?: string;
      minContribution?: string;
      imageUrl?: string | null;
    },
  ): Promise<WishlistItem> {
    const w = await this.findOne(wishlistId, ownerId);
    const maxOrder = (await this.itemModel.max('sortOrder', { where: { wishlistId } })) as number | null;
    const item = await this.itemModel.create({
      wishlistId,
      title: data.title,
      link: data.link ?? null,
      price: data.price ?? null,
      currency: data.currency ?? null,
      targetAmount: data.targetAmount ?? null,
      minContribution: data.minContribution ?? null,
      imageUrl: data.imageUrl ?? null,
      sortOrder: (maxOrder ?? 0) + 1,
    });
    this.eventsGateway.emitWishlistUpdate(w.shareToken, { type: 'items' });
    return item;
  }

  async updateItem(
    itemId: string,
    ownerId: string,
    data: Partial<{
      title: string;
      link: string | null;
      price: string | null;
      currency: string | null;
      targetAmount: string;
      minContribution: string;
      imageUrl: string | null;
    }>,
  ): Promise<WishlistItem> {
    const item = await this.itemModel.findByPk(itemId, {
      include: [{ model: Wishlist, as: 'wishlist' }],
    });
    if (!item || (item as any).wishlist?.ownerId !== ownerId) {
      throw new NotFoundException('Item not found');
    }
    const updateData: Record<string, unknown> = { ...data };
    if (updateData.link === '') updateData.link = null;
    if (updateData.imageUrl === '') updateData.imageUrl = null;
    if (updateData.price === '' || updateData.price === null) {
      updateData.price = null;
      updateData.currency = null;
    }
    await item.update(updateData as any);
    const wishlist = (item as any).wishlist as Wishlist;
    this.eventsGateway.emitWishlistUpdate(wishlist.shareToken, { type: 'items' });
    return item;
  }

  async removeItem(itemId: string, ownerId: string): Promise<void> {
    const item = await this.itemModel.findByPk(itemId, {
      include: [{ model: Wishlist, as: 'wishlist' }],
    });
    if (!item || (item as any).wishlist?.ownerId !== ownerId) {
      throw new NotFoundException('Item not found');
    }
    const wishlist = (item as any).wishlist as Wishlist;
    await item.destroy();
    this.eventsGateway.emitWishlistUpdate(wishlist.shareToken, { type: 'items' });
  }

  async reserve(itemId: string, userId: string, note?: string): Promise<Reservation> {
    const item = await this.itemModel.findByPk(itemId, {
      include: [{ model: Wishlist, as: 'wishlist' }, { model: Reservation, as: 'reservation' }],
    });
    if (!item) throw new NotFoundException('Item not found');
    const wishlist = (item as any).wishlist as Wishlist;
    if (wishlist.ownerId === userId) throw new BadRequestException('Owner cannot reserve');
    const existing = (item as any).reservation;
    if (existing) throw new BadRequestException('Already reserved');
    const reservation = await this.reservationModel.create({
      wishlistItemId: itemId,
      userId,
      note: note ?? null,
    });
    this.eventsGateway.emitWishlistUpdate(wishlist.shareToken, {
      type: 'reservation',
      data: { wishlistItemId: itemId },
    });
    return reservation;
  }

  async cancelReservation(itemId: string, userId: string): Promise<void> {
    const item = await this.itemModel.findByPk(itemId, {
      include: [{ model: Wishlist, as: 'wishlist' }, { model: Reservation, as: 'reservation' }],
    });
    if (!item) throw new NotFoundException('Item not found');
    const existing = (item as any).reservation as Reservation | undefined;
    if (!existing || existing.userId !== userId) {
      throw new BadRequestException('Reservation not found or you are not the reserver');
    }
    await existing.destroy();
    const wishlist = (item as any).wishlist as Wishlist;
    this.eventsGateway.emitWishlistUpdate(wishlist.shareToken, {
      type: 'reservation',
      data: { wishlistItemId: itemId },
    });
  }

  async contribute(itemId: string, userId: string, amount: string): Promise<Contribution> {
    const item = await this.itemModel.findByPk(itemId, {
      include: [{ model: Wishlist, as: 'wishlist' }],
    });
    if (!item) throw new NotFoundException('Item not found');
    const wishlist = (item as any).wishlist as Wishlist;
    if (wishlist.ownerId === userId) throw new BadRequestException('Owner cannot contribute');
    const target = parseFloat(item.targetAmount || item.price || '0') || 0;
    if (target <= 0) throw new BadRequestException('Item does not accept contributions');
    const numAmount = parseFloat(amount);
    if (item.minContribution && numAmount < parseFloat(item.minContribution)) {
      throw new BadRequestException('Below minimum contribution');
    }
    const sum = await this.contributionModel.sum('amount', {
      where: { wishlistItemId: itemId },
    });
    const currentTotal = parseFloat(String(sum || 0));
    const existing = await this.contributionModel.findOne({
      where: { wishlistItemId: itemId, userId },
    });
    const existingAmount = existing ? parseFloat(existing.amount) : 0;
    const newTotal = currentTotal - existingAmount + numAmount;
    if (newTotal > target) {
      throw new BadRequestException('Contribution would exceed target');
    }
    let contribution: Contribution;
    if (existing) {
      await existing.update({ amount });
      contribution = existing;
    } else {
      contribution = await this.contributionModel.create({
        wishlistItemId: itemId,
        userId,
        amount,
      });
    }
    this.eventsGateway.emitWishlistUpdate(wishlist.shareToken, {
      type: 'contribution',
      data: { wishlistItemId: itemId },
    });
    return contribution;
  }

  async updateContribution(itemId: string, userId: string, amount: string): Promise<Contribution> {
    return this.contribute(itemId, userId, amount);
  }

  async removeContribution(itemId: string, userId: string): Promise<void> {
    const item = await this.itemModel.findByPk(itemId, {
      include: [{ model: Wishlist, as: 'wishlist' }],
    });
    if (!item) throw new NotFoundException('Item not found');
    const wishlist = (item as any).wishlist as Wishlist;
    if (wishlist.ownerId === userId) throw new BadRequestException('Owner cannot remove contribution');
    const deleted = await this.contributionModel.destroy({
      where: { wishlistItemId: itemId, userId },
    });
    if (deleted) {
      this.eventsGateway.emitWishlistUpdate(wishlist.shareToken, {
        type: 'contribution',
        data: { wishlistItemId: itemId },
      });
    }
  }

  async getWishlistIdByShareToken(token: string): Promise<string | null> {
    const w = await this.wishlistModel.findOne({ where: { shareToken: token }, attributes: ['id'] });
    return w?.id ?? null;
  }
}
