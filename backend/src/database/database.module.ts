import { Inject, Module, OnApplicationBootstrap } from '@nestjs/common';
import { getConnectionToken, SequelizeModule } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize';
import { User } from './models/user.model';
import { Wishlist } from './models/wishlist.model';
import { WishlistItem } from './models/wishlist-item.model';
import { Reservation } from './models/reservation.model';
import { Contribution } from './models/contribution.model';
import { initUserModel } from './models/user.model';
import { initWishlistModel } from './models/wishlist.model';
import { initWishlistItemModel } from './models/wishlist-item.model';
import { initReservationModel } from './models/reservation.model';
import { initContributionModel } from './models/contribution.model';

const models = [User, Wishlist, WishlistItem, Reservation, Contribution];

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      useFactory: () => ({
        dialect: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_DATABASE || 'wishlist_db',
        autoLoadModels: false,
        models: [],
        synchronize: true,
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
      }),
    }),
    SequelizeModule.forFeature(models),
  ],
  exports: [SequelizeModule],
})
export class DatabaseModule implements OnApplicationBootstrap {
  constructor(
    @Inject(getConnectionToken()) private readonly sequelize: Sequelize,
  ) {}

  async onApplicationBootstrap() {
    const seq = this.sequelize;
    initUserModel(seq);
    initWishlistModel(seq);
    initWishlistItemModel(seq);
    initReservationModel(seq);
    initContributionModel(seq);

    User.hasMany(Wishlist, { foreignKey: 'ownerId', as: 'ownedWishlists' });
    Wishlist.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

    Wishlist.hasMany(WishlistItem, { foreignKey: 'wishlistId', as: 'items' });
    WishlistItem.belongsTo(Wishlist, { foreignKey: 'wishlistId', as: 'wishlist' });

    WishlistItem.hasMany(Reservation, { foreignKey: 'wishlistItemId', as: 'reservations' });
    Reservation.belongsTo(WishlistItem, { foreignKey: 'wishlistItemId', as: 'wishlistItem' });
    User.hasMany(Reservation, { foreignKey: 'userId' });
    Reservation.belongsTo(User, { foreignKey: 'userId', as: 'user' });

    WishlistItem.hasMany(Contribution, { foreignKey: 'wishlistItemId', as: 'contributions' });
    Contribution.belongsTo(WishlistItem, { foreignKey: 'wishlistItemId', as: 'wishlistItem' });
    User.hasMany(Contribution, { foreignKey: 'userId' });
    Contribution.belongsTo(User, { foreignKey: 'userId', as: 'user' });

    const alter = process.env.NODE_ENV !== 'production';
    await seq.sync({ alter });
  }
}
