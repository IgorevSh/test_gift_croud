import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReqUser } from '../auth/decorators/user.decorator';
import { User } from '../database/models/user.model';
import { WishlistsService } from './wishlists.service';
import { IsString, IsOptional, IsUrl, ValidateIf, IsNotEmpty } from 'class-validator';

class CreateWishlistDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;
}

class UpdateWishlistDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

class AddItemDto {
  @IsNotEmpty({ message: 'Название не должно быть пустым' })
  @IsString()
  title: string;

  @IsOptional()
  @ValidateIf((_o, v) => v != null && v !== '')
  @IsUrl({ require_protocol: true, protocols: ['http', 'https'] })
  link?: string | null;

  @IsOptional()
  @ValidateIf((_o, v) => v != null)
  @IsString()
  price?: string | null;

  @IsOptional()
  @ValidateIf((_o, v) => v != null)
  @IsString()
  currency?: string | null;

  @IsOptional()
  @IsString()
  targetAmount?: string;

  @IsOptional()
  @IsString()
  minContribution?: string;

  @IsOptional()
  @ValidateIf((_o, v) => v != null && v !== '')
  @IsUrl({ require_protocol: true, protocols: ['http', 'https'] })
  imageUrl?: string | null;
}

class UpdateItemDto extends AddItemDto {}

class ReserveDto {
  @IsOptional()
  @IsString()
  note?: string;
}

class ContributeDto {
  @IsString()
  amount: string;
}

@Controller('wishlists')
@UseGuards(JwtAuthGuard)
export class WishlistsController {
  constructor(private wishlistsService: WishlistsService) {}

  @Post()
  create(@ReqUser() user: User, @Body() dto: CreateWishlistDto) {
    return this.wishlistsService.create(user.id, dto.title, dto.description);
  }

  @Get()
  findMy(@ReqUser() user: User) {
    return this.wishlistsService.findMy(user.id);
  }

  @Get(':id')
  findOne(@ReqUser() user: User, @Param('id') id: string) {
    return this.wishlistsService.findOne(id, user.id);
  }

  @Put(':id')
  update(
    @ReqUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateWishlistDto,
  ) {
    return this.wishlistsService.update(id, user.id, dto);
  }

  @Delete(':id')
  remove(@ReqUser() user: User, @Param('id') id: string) {
    return this.wishlistsService.remove(id, user.id);
  }

  @Post(':id/items')
  addItem(
    @ReqUser() user: User,
    @Param('id') id: string,
    @Body() dto: AddItemDto,
  ) {
    return this.wishlistsService.addItem(id, user.id, dto);
  }

  @Put('items/:itemId')
  updateItem(
    @ReqUser() user: User,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateItemDto,
  ) {
    return this.wishlistsService.updateItem(itemId, user.id, dto);
  }

  @Delete('items/:itemId')
  removeItem(@ReqUser() user: User, @Param('itemId') itemId: string) {
    return this.wishlistsService.removeItem(itemId, user.id);
  }

  @Post('items/:itemId/reserve')
  reserve(
    @ReqUser() user: User,
    @Param('itemId') itemId: string,
    @Body() dto: ReserveDto,
  ) {
    return this.wishlistsService.reserve(itemId, user.id, dto.note);
  }

  @Delete('items/:itemId/reserve')
  cancelReservation(@ReqUser() user: User, @Param('itemId') itemId: string) {
    return this.wishlistsService.cancelReservation(itemId, user.id);
  }

  @Post('items/:itemId/contribute')
  contribute(
    @ReqUser() user: User,
    @Param('itemId') itemId: string,
    @Body() dto: ContributeDto,
  ) {
    return this.wishlistsService.contribute(itemId, user.id, dto.amount);
  }

  @Put('items/:itemId/contribute')
  updateContribution(
    @ReqUser() user: User,
    @Param('itemId') itemId: string,
    @Body() dto: ContributeDto,
  ) {
    return this.wishlistsService.updateContribution(itemId, user.id, dto.amount);
  }

  @Delete('items/:itemId/contribute')
  removeContribution(@ReqUser() user: User, @Param('itemId') itemId: string) {
    return this.wishlistsService.removeContribution(itemId, user.id);
  }
}
