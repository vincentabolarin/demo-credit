import { Global, Module } from '@nestjs/common';
import { KNEX_CONNECTION, knexProvider } from './knex.provider';

@Global()
@Module({
  providers: [knexProvider],
  exports: [knexProvider, KNEX_CONNECTION],
})
export class DatabaseModule {}
