import { Model, DataTypes, Optional } from 'sequelize';
import { Sequelize } from 'sequelize';

export interface ReservationAttributes {
  id: string;
  wishlistItemId: string;
  userId: string;
  note: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ReservationCreationAttributes = Optional<ReservationAttributes, 'id'>;

export class Reservation extends Model<ReservationAttributes, ReservationCreationAttributes> {
  declare id: string;
  declare wishlistItemId: string;
  declare userId: string;
  declare note: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export function initReservationModel(sequelize: Sequelize): typeof Reservation {
  Reservation.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      wishlistItemId: { type: DataTypes.UUID, allowNull: false },
      userId: { type: DataTypes.UUID, allowNull: false },
      note: { type: DataTypes.TEXT, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    },
    { sequelize, tableName: 'reservations', timestamps: true, underscored: true },
  );
  return Reservation;
}
