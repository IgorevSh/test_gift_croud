import { Model, DataTypes, Optional } from 'sequelize';
import { Sequelize } from 'sequelize';

export interface ContributionAttributes {
  id: string;
  wishlistItemId: string;
  userId: string;
  amount: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ContributionCreationAttributes = Optional<ContributionAttributes, 'id'>;

export class Contribution extends Model<ContributionAttributes, ContributionCreationAttributes> {
  declare id: string;
  declare wishlistItemId: string;
  declare userId: string;
  declare amount: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export function initContributionModel(sequelize: Sequelize): typeof Contribution {
  Contribution.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      wishlistItemId: { type: DataTypes.UUID, allowNull: false },
      userId: { type: DataTypes.UUID, allowNull: false },
      amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    },
    { sequelize, tableName: 'contributions', timestamps: true, underscored: true },
  );
  return Contribution;
}
