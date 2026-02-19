import {
  Body,
  Controller,
  Get,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ReqUser } from './decorators/user.decorator';
import { User } from '../database/models/user.model';
import { AuthService, AuthResult } from './auth.service';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  displayName?: string;
}

class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@ReqUser() user: User) {
    return { id: user.id, email: user.email, displayName: user.displayName };
  }

  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<AuthResult> {
    return this.authService.register(
      dto.email,
      dto.password,
      dto.displayName,
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<AuthResult> {
    const user = await this.authService.validateUser(dto.email, dto.password);
    if (!user) throw new UnauthorizedException('INVALID_CREDENTIALS');
    return this.authService.login(user);
  }
}
