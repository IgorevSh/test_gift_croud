import { Model, DataTypes, Optional } from 'sequelize';
import { Sequelize } from 'sequelize';

export interface WishlistAttributes {
  id: string;
  ownerId: string;
  title: string;
  description: string | null;
  shareToken: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type WishlistCreationAttributes = Optional<WishlistAttributes, 'id'>;

export class Wishlist extends Model<WishlistAttributes, WishlistCreationAttributes> {
  declare id: string;
  declare ownerId: string;
  declare title: string;
  declare description: string | null;
  declare shareToken: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export function initWishlistModel(sequelize: Sequelize): typeof Wishlist {
  Wishlist.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      ownerId: { type: DataTypes.UUID, allowNull: false },
      title: { type: DataTypes.STRING(255), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      shareToken: { type: DataTypes.STRING(64), allowNull: false, unique: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    },
    { sequelize, tableName: 'wishlists', timestamps: true, underscored: true },
  );
  return Wishlist;
}
