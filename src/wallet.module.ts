import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Player } from './wallet/domain/player.entity';
import { Transaction } from './wallet/domain/transaction.entity';
import { WalletService } from './wallet/application/wallet.service';

@Module({
  imports: [MikroOrmModule.forFeature([Player, Transaction])],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
