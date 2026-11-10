import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Player } from './wallet/domain/player.entity';
import { Transaction } from './wallet/domain/transaction.entity';
import { WalletService } from './wallet/application/wallet.service';
import { WalletController } from './wallet/presentation/wallet.controller';

@Module({
  imports: [MikroOrmModule.forFeature([Player, Transaction])],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
