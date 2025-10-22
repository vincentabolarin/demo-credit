import { Injectable, Inject } from '@nestjs/common';
import { Knex } from 'knex';
import { type FormattedUser } from '../auth/interfaces/user.interface';
import { GetTransactionsQueryDto } from './dto/get-transactions-query.dto';
import { TransactionsResponseDto } from './dto/transactions-response.dto';
import { KNEX_CONNECTION } from 'src/config/knex.provider';
import {
  FlatTransactionWithUsers,
  TransactionUser,
} from './interfaces/transactions.interface';

@Injectable()
export class TransactionsService {
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  private mapToTransactionWithUsers(
    row: FlatTransactionWithUsers,
  ): TransactionsResponseDto {
    const fromUser: TransactionUser | null = row.from_user_id
      ? {
          id: row.from_user_id,
          firstName: row.from_user_first_name ?? '',
          lastName: row.from_user_last_name ?? '',
          email: row.from_user_email ?? '',
        }
      : null;

    const toUser: TransactionUser | null = row.to_user_id
      ? {
          id: row.to_user_id,
          firstName: row.to_user_first_name ?? '',
          lastName: row.to_user_last_name ?? '',
          email: row.to_user_email ?? '',
        }
      : null;

    return {
      id: row.id,
      reference: row.reference,
      amount: row.amount,
      type: row.type,
      meta: row.meta,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      fromUser,
      toUser,
    };
  }

  async getTransactionsForUser(
    user: FormattedUser,
    query: GetTransactionsQueryDto,
  ) {
    const { page, size, type, q } = query;
    const pageValue = Math.max(1, Number(page) || 1);
    const sizeValue = Math.min(100, Math.max(1, Number(size) || 10));

    let base = this.knex('transactions').where(function () {
      this.where('from_user_id', user.id).orWhere('to_user_id', user.id);
    });

    if (type) base = base.andWhere('type', type.toUpperCase());

    if (q) {
      base = base.andWhere(function () {
        this.where('reference', 'like', `%${q}%`).orWhereRaw('meta like ?', [
          `%${q}%`,
        ]);
      });
    }

    const totalResult = await base
      .clone()
      .count<{ count: string }>({ count: 'id' })
      .first();
    const total = Number(totalResult?.count || 0);

    const rows = await base
      .clone()
      .select([
        'transactions.*',
        'from_user.id as from_user_id',
        'from_user.first_name as from_user_first_name',
        'from_user.last_name as from_user_last_name',
        'from_user.email as from_user_email',
        'to_user.id as to_user_id',
        'to_user.first_name as to_user_first_name',
        'to_user.last_name as to_user_last_name',
        'to_user.email as to_user_email',
      ])
      .leftJoin(
        'users as from_user',
        'transactions.from_user_id',
        'from_user.id',
      )
      .leftJoin('users as to_user', 'transactions.to_user_id', 'to_user.id')
      .orderBy('transactions.created_at', 'desc')
      .limit(sizeValue)
      .offset((pageValue - 1) * sizeValue);

    const transformedRows = rows.map((row: FlatTransactionWithUsers) =>
      this.mapToTransactionWithUsers(row),
    );

    const meta = {
      page: pageValue,
      size: sizeValue,
      total,
    };

    return {
      message: 'Transactions fetched successfully',
      data: transformedRows,
      meta,
    };
  }
}
