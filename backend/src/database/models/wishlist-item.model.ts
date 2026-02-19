import { Model, DataTypes, Optional } from 'sequelize';
import { Sequelize } from 'sequelize';

export interface WishlistItemAttributes {
  id: string;
  wishlistId: string;
  title: string;
  link: string | null;
  price: string | null;
  currency: string | null;
  targetAmount: string | null;
  minContribution: string | null;
  imageUrl: string | null;
  sortOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type WishlistItemCreationAttributes = Optional<WishlistItemAttributes, 'id'>;

export class WishlistItem extends Model<WishlistItemAttributes, WishlistItemCreationAttributes> {
  declare id: string;
  declare wishlistId: string;
  declare title: string;
  declare link: string | null;
  declare price: string | null;
  declare currency: string | null;
  declare targetAmount: string | null;
  declare minContribution: string | null;
  declare imageUrl: string | null;
  declare sortOrder: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export function initWishlistItemModel(sequelize: Sequelize): typeof WishlistItem {
  WishlistItem.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      wishlistId: { type: DataTypes.UUID, allowNull: false },
      title: { type: DataTypes.STRING(500), allowNull: false },
      link: { type: DataTypes.TEXT, allowNull: true },
      price: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
      currency: { type: DataTypes.STRING(10), allowNull: true },
      targetAmount: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
      minContribution: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
      imageUrl: { type: DataTypes.TEXT, allowNull: true },
      sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    },
    { sequelize, tableName: 'wishlist_items', timestamps: true, underscored: true },
  );
  return WishlistItem;
}
