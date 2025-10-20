import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import configuration from '../../config/configuration';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

const config = configuration();

@Module({
  imports: [
    JwtModule.register({
      secret: config.jwt.secret,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
