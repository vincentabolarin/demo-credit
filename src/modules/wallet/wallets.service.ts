import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { KNEX_CONNECTION } from '../../config/knex.provider';
import { Knex } from 'knex';
import Decimal from 'decimal.js';
import { v4 as uuidv4 } from 'uuid';
import { Wallet } from './interfaces/wallets.interface';
import { Transaction } from '../transaction/interfaces/transactions.interface';
import { WalletResponseDto } from './dto/wallet-response.dto';

@Injectable()
export class WalletsService {
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  private toWalletResponseDto(wallet: Wallet): WalletResponseDto {
    return {
      id: wallet.id,
      userId: wallet.user_id,
      balance: wallet.balance,
      currency: wallet.currency,
      createdAt: wallet.created_at,
      updatedAt: wallet.updated_at,
    };
  }

  async getWalletByUserId(userId: string) {
    const wallet = await this.knex<Wallet>('wallets')
      .where({ user_id: userId })
      .first();

    if (!wallet) {
      throw new NotFoundException(
        `Wallet for user with ID ${userId} not found.`,
      );
    }

    const walletResponse = this.toWalletResponseDto(wallet);

    return {
      message: 'Wallet fetched successfully',
      data: walletResponse,
    };
  }

  async fund(userId: string, amount: number) {
    if (amount <= 0) throw new BadRequestException('Invalid amount');

    return this.knex.transaction(async (trx) => {
      const wallet = await trx<Wallet>('wallets')
        .where({ user_id: userId })
        .first();
      if (!wallet) throw new BadRequestException('Wallet not found');

      const newBal = new Decimal(wallet.balance).plus(new Decimal(amount));
      await trx('wallets')
        .where({ id: wallet.id })
        .update({
          balance: trx.raw(newBal.toFixed(8)),
          updated_at: trx.fn.now(),
        });

      const reference = `FUND-${uuidv4()}`;
      await trx<Transaction>('transactions').insert({
        id: uuidv4(),
        reference,
        from_wallet_id: null,
        to_wallet_id: wallet.id,
        amount: trx.raw(new Decimal(amount).toFixed(8)),
        type: 'FUNDING',
        meta: JSON.stringify({ source: 'api' }),
      });

      const response = await trx<Wallet>('wallets')
        .where({ id: wallet.id })
        .first();

      if (!response) throw new BadRequestException('Wallet not found');

      const walletResponse = this.toWalletResponseDto(response);

      return {
        message: 'Wallet funded successfully',
        data: { wallet: walletResponse },
      };
    });
  }

  async withdraw(userId: string, amount: number) {
    if (amount <= 0) throw new BadRequestException('Invalid amount');
    return this.knex.transaction(async (trx) => {
      const wallet = await trx<Wallet>('wallets')
        .where({ user_id: userId })
        .first();
      if (!wallet) throw new BadRequestException('Wallet not found');

      const currentBalance = new Decimal(wallet.balance);
      if (currentBalance.lessThan(amount))
        throw new BadRequestException('Insufficient funds');

      const newBal = currentBalance.minus(new Decimal(amount));
      await trx('wallets')
        .where({ id: wallet.id })
        .update({ balance: newBal.toFixed(8), updated_at: trx.fn.now() });

      const reference = `WD-${uuidv4()}`;
      await trx<Transaction>('transactions').insert({
        id: uuidv4(),
        reference,
        from_wallet_id: wallet.id,
        to_wallet_id: null,
        amount: trx.raw(new Decimal(amount).toFixed(8)),
        type: 'WITHDRAWAL',
        meta: JSON.stringify({ destination: 'api' }),
      });

      const response = await trx<Wallet>('wallets')
        .where({ id: wallet.id })
        .first();

      if (!response) throw new BadRequestException('Wallet not found');

      const walletResponse = this.toWalletResponseDto(response);

      return {
        message: 'Withdrawal successful',
        data: { wallet: walletResponse },
      };
    });
  }

  async transfer(fromUserId: string, toUserId: string, amount: number) {
    if (amount <= 0) throw new BadRequestException('Invalid amount');
    if (fromUserId === toUserId)
      throw new BadRequestException('Cannot transfer to self');

    return this.knex.transaction(async (trx) => {
      const fromWallet = await trx<Wallet>('wallets')
        .where({ user_id: fromUserId })
        .first();

      if (!fromWallet) throw new BadRequestException('Sender wallet not found');

      const toWallet = await trx<Wallet>('wallets')
        .where({ user_id: toUserId })
        .first();

      if (!toWallet)
        throw new BadRequestException('Recipient wallet not found');

      const fromBalance = new Decimal(fromWallet.balance);
      if (fromBalance.lessThan(amount))
        throw new BadRequestException('Insufficient funds');

      const newFromBalance = fromBalance.minus(new Decimal(amount));
      const newToBalance = new Decimal(toWallet.balance).plus(
        new Decimal(amount),
      );

      await trx('wallets')
        .where({ id: fromWallet.id })
        .update({
          balance: newFromBalance.toFixed(8),
          updated_at: trx.fn.now(),
        });

      await trx('wallets')
        .where({ id: toWallet.id })
        .update({ balance: newToBalance.toFixed(8), updated_at: trx.fn.now() });

      const reference = `TR-${uuidv4()}`;
      await trx<Transaction>('transactions').insert({
        id: uuidv4(),
        reference,
        from_wallet_id: fromWallet.id,
        to_wallet_id: toWallet.id,
        amount: trx.raw(new Decimal(amount).toFixed(8)),
        type: 'TRANSFER',
        meta: JSON.stringify({ note: 'user transfer' }),
      });

      const updatedFromWallet = await trx<Wallet>('wallets')
        .where({ id: fromWallet.id })
        .first();

      if (!updatedFromWallet) throw new BadRequestException('Wallet not found');

      const walletResponse = this.toWalletResponseDto(updatedFromWallet);

      return {
        message: 'Transfer successful',
        data: { wallet: walletResponse },
      };
    });
  }
}
