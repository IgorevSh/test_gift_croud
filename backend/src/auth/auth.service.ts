import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import { User } from '../database/models/user.model';

export interface JwtPayload {
  sub: string;
  email: string;
}

export interface AuthResult {
  accessToken: string;
  user: { id: string; email: string; displayName: string | null };
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User) private userModel: typeof User,
    private jwtService: JwtService,
  ) {}

  async register(
    email: string,
    password: string,
    displayName?: string,
  ): Promise<AuthResult> {
    const existing = await this.userModel.findOne({ where: { email } });
    if (existing) {
      throw new BadRequestException('USER_EXISTS');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.userModel.create({
      email,
      passwordHash,
      displayName: displayName || null,
    });
    return this.login(user);
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userModel.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return null;
    }
    return user;
  }

  async login(user: User): Promise<AuthResult> {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);
    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      },
    };
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findByPk(id);
  }
}
