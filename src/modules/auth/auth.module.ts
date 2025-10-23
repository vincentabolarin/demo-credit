import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import configuration from '../../config/configuration';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { BlacklistModule } from '../blacklist/blacklist.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => {
        const config = configuration();
        return {
          secret: config.jwt.secret,
          signOptions: { expiresIn: '1h' },
        };
      },
    }),
    BlacklistModule,
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
