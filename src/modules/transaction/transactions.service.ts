import { Injectable, Inject } from '@nestjs/common';
import { Knex } from 'knex';
import { type FormattedUser } from '../auth/interfaces/user.interface';
import { Wallet } from '../wallet/interfaces/wallets.interface';
import { Transaction } from './interfaces/transactions.interface';
import { KNEX_CONNECTION } from 'src/config/knex.provider';
import { GetTransactionsQueryDto } from './dto/get-transactions-query.dto';

@Injectable()
export class TransactionsService {
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  async getTransactionsForUser(
    user: FormattedUser,
    query: GetTransactionsQueryDto,
  ) {
    const { page, size, type, q } = query;
    const pageValue = Math.max(1, Number(page) || 1);
    const sizeValue = Math.min(100, Math.max(1, Number(size) || 10));

    const walletIdsQuery = this.knex<Wallet>('wallets')
      .select('id')
      .where({ user_id: user.id });

    let base = this.knex<Transaction>('transactions').where(function () {
      this.where('from_wallet_id', 'in', walletIdsQuery).orWhere(
        'to_wallet_id',
        'in',
        walletIdsQuery,
      );
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
      .orderBy('created_at', 'desc')
      .limit(sizeValue)
      .offset((pageValue - 1) * sizeValue);

    const meta = {
      page: pageValue,
      size: sizeValue,
      total,
    };

    return {
      message: 'Transactions fetched successfully',
      data: rows,
      meta,
    };
  }
}
