import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DatabaseModule } from './config/knex.module';
import { BlacklistModule } from './modules/blacklist/blacklist.module';

@Module({
  imports: [DatabaseModule, AuthModule, UsersModule, BlacklistModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
