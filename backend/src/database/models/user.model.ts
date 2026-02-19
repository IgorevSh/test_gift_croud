import { Model, DataTypes, Optional } from 'sequelize';
import { Sequelize } from 'sequelize';

export interface UserAttributes {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserCreationAttributes = Optional<UserAttributes, 'id'>;

export class User extends Model<UserAttributes, UserCreationAttributes> {
  declare id: string;
  declare email: string;
  declare passwordHash: string;
  declare displayName: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export function initUserModel(sequelize: Sequelize): typeof User {
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
      passwordHash: { type: DataTypes.STRING(255), allowNull: false },
      displayName: { type: DataTypes.STRING(100), allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    },
    { sequelize, tableName: 'users', timestamps: true, underscored: true },
  );
  return User;
}
