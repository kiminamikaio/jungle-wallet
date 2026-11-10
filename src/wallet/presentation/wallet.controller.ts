import {
  Controller,
  Get,
  NotFoundException,
  Post,
  UnprocessableEntityException,
  Body,
  Param,
} from '@nestjs/common';
import { NotFoundError } from '@mikro-orm/core';
import { AmountDto } from '../application/dto/amount.dto';
import { CreatePlayerDto } from '../application/dto/create-player.dto';
import { WalletService } from '../application/wallet.service';
import { InsufficientBalanceError } from '../domain/errors';

@Controller('players')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  createPlayer(@Body() dto: CreatePlayerDto) {
    return this.walletService.createPlayer(dto);
  }

  @Post(':id/deposit')
  deposit(@Param('id') id: string, @Body() dto: AmountDto) {
    return this.withPlayerErrorMapping(() => this.walletService.deposit(id, dto));
  }

  @Post(':id/bet')
  bet(@Param('id') id: string, @Body() dto: AmountDto) {
    return this.withPlayerErrorMapping(() => this.walletService.bet(id, dto));
  }

  @Post(':id/win')
  win(@Param('id') id: string, @Body() dto: AmountDto) {
    return this.withPlayerErrorMapping(() => this.walletService.win(id, dto));
  }

  @Get(':id/balance')
  getBalance(@Param('id') id: string) {
    return this.withPlayerErrorMapping(() => this.walletService.getBalance(id));
  }

  @Get(':id/transactions')
  listTransactions(@Param('id') id: string) {
    return this.withPlayerErrorMapping(() =>
      this.walletService.listTransactions(id),
    );
  }

  private async withPlayerErrorMapping<T>(
    operation: () => Promise<T>,
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof InsufficientBalanceError) {
        throw new UnprocessableEntityException(error.message);
      }

      if (error instanceof NotFoundError) {
        throw new NotFoundException('Player not found');
      }

      throw error;
    }
  }
}
