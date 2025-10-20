import { Provider } from '@nestjs/common';
import knex, { Knex } from 'knex';
import configuration from './configuration';

export const KNEX_CONNECTION = 'KNEX_CONNECTION';

export const knexProvider: Provider = {
  provide: KNEX_CONNECTION,
  useFactory: (): Promise<Knex> => {
    const config = configuration();
    const env = process.env.NODE_ENV || 'development';

    if (env === 'test') {
      return Promise.resolve(
        knex({
          client: config.db.devClient,
          connection: { filename: config.db.testFilename },
          useNullAsDefault: true,
          pool: { min: 1, max: 1 },
        }),
      );
    }

    if (env === 'development') {
      return Promise.resolve(
        knex({
          client: config.db.devClient,
          connection: { filename: config.db.devFileName },
          useNullAsDefault: true,
          pool: { min: 1, max: 1 },
        }),
      );
    }

    return Promise.resolve(
      knex({
        client: config.db.client,
        connection: {
          host: config.db.host,
          port: config.db.port,
          user: config.db.user,
          password: config.db.password,
          database: config.db.database,
        },
        pool: { min: 2, max: 10 },
      }),
    );
  },
};
