import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
// import { BlacklistModule } from '../blacklist/blacklist.module';

@Module({
  // imports: [BlacklistModule],
  imports: [],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
