import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseModule } from './config/knex.module';
import { BlacklistModule } from './modules/blacklist/blacklist.module';
import { WalletsModule } from './modules/wallet/wallets.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { AllExceptionsFilter } from './common/filters/all-exceptions-filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { TransactionsModule } from './modules/transaction/transactions.module';
import { HealthModule } from './modules/health/health.module';
import { UsersModule } from './modules/users/users.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 20,
        },
      ],
    }),
    DatabaseModule,
    HealthModule,
    AuthModule,
    UsersModule,
    BlacklistModule,
    WalletsModule,
    TransactionsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
