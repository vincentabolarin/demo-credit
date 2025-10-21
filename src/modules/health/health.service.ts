import { Injectable, Inject } from '@nestjs/common';
import { Knex } from 'knex';
import { KNEX_CONNECTION } from 'src/config/knex.provider';

export interface HealthCheckResult {
  status: 'ok' | 'error';
  database: 'connected' | 'disconnected';
  error?: string;
}

@Injectable()
export class HealthService {
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  async check(): Promise<HealthCheckResult> {
    try {
      await this.knex.raw('SELECT 1');

      return {
        status: 'ok',
        database: 'connected',
      };
    } catch (error) {
      return {
        status: 'error',
        database: 'disconnected',
        error:
          error instanceof Error ? error.message : 'Unknown database error',
      };
    }
  }
}
