import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import mikroOrmConfig from './wallet/infra/mikro-orm.config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { WalletModule } from './wallet.module';

@Module({
  imports: [MikroOrmModule.forRoot(mikroOrmConfig), WalletModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
