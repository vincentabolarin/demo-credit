import { WalletsService } from './wallets.service';
import { createTestingModule } from '../../../test/common/test-utils';
import { KNEX_CONNECTION } from '../../config/knex.provider';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  createKnexCallableMock,
  createTrxMock,
  MockedKnexCallable,
} from 'test/common/knex-callable-mock';
import type { Wallet } from './interfaces/wallets.interface';

describe('WalletsService (unit)', () => {
  let service: WalletsService;
  let knex: MockedKnexCallable;
  let resetMocks: () => void;

  const mockWallet: Wallet = {
    id: 'wallet-1',
    user_id: 'user-1',
    balance: 1000.0,
    currency: 'NGN',
    created_at: new Date('2025-01-01'),
    updated_at: new Date('2025-01-01'),
  };

  beforeEach(async () => {
    const knexMock = createKnexCallableMock();

    const { module, resetMocks: rm } = await createTestingModule([
      WalletsService,
      { provide: KNEX_CONNECTION, useValue: knexMock },
    ]);

    resetMocks = rm;
    knex = module.get<MockedKnexCallable>(KNEX_CONNECTION);
    service = module.get(WalletsService);
  });

  afterEach(() => {
    resetMocks();
    jest.clearAllMocks();
  });

  describe('getWalletByUserId', () => {
    it('returns wallet when found', async () => {
      knex.where.mockReturnThis();
      knex.first.mockResolvedValueOnce(mockWallet);

      const result = await service.getWalletByUserId('user-1');

      expect(result.message).toBe('Wallet fetched successfully');
      expect(result.data).toMatchObject({
        id: 'wallet-1',
        userId: 'user-1',
        balance: 1000.0,
        currency: 'NGN',
      });
      expect(knex).toHaveBeenCalledWith('wallets');
      expect(knex.where).toHaveBeenCalledWith({ user_id: 'user-1' });
    });

    it('throws NotFoundException when wallet not found', async () => {
      knex.where.mockReturnThis();
      knex.first.mockResolvedValueOnce(undefined);

      await expect(service.getWalletByUserId('user-999')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getWalletByUserId('user-999')).rejects.toThrow(
        'Wallet for user with ID user-999 not found.',
      );
    });
  });

  describe('fund', () => {
    it('successfully funds a wallet', async () => {
      const updatedWallet = {
        ...mockWallet,
        balance: 1500.0,
        updated_at: new Date('2025-01-02'),
      };

      knex.transaction.mockImplementation(
        async <T>(cb: (trx: MockedKnexCallable) => Promise<T>): Promise<T> => {
          const trx = createTrxMock(updatedWallet);

          // Mock first call to get wallet
          trx.first.mockResolvedValueOnce(mockWallet);
          // Mock second call to get updated wallet
          trx.first.mockResolvedValueOnce(updatedWallet);

          return await cb(trx);
        },
      );

      const result = await service.fund('user-1', 500);

      expect(result.message).toBe('Wallet funded successfully');
      expect(result.data.wallet.balance).toBe(1500.0);
      expect(knex.transaction).toHaveBeenCalled();
    });

    it('throws BadRequestException when amount is zero', async () => {
      await expect(service.fund('user-1', 0)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.fund('user-1', 0)).rejects.toThrow('Invalid amount');
    });

    it('throws BadRequestException when amount is negative', async () => {
      await expect(service.fund('user-1', -100)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequestException when wallet not found', async () => {
      knex.transaction.mockImplementation(
        async <T>(cb: (trx: MockedKnexCallable) => Promise<T>): Promise<T> => {
          const trx = createTrxMock();
          trx.first.mockResolvedValueOnce(undefined);
          return await cb(trx);
        },
      );

      await expect(service.fund('user-999', 500)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.fund('user-999', 500)).rejects.toThrow(
        'Wallet not found',
      );
    });
  });

  describe('withdraw', () => {
    it('successfully withdraws from wallet', async () => {
      const updatedWallet = {
        ...mockWallet,
        balance: 700.0,
        updated_at: new Date('2025-01-02'),
      };

      knex.transaction.mockImplementation(
        async <T>(cb: (trx: MockedKnexCallable) => Promise<T>): Promise<T> => {
          const trx = createTrxMock(updatedWallet);

          trx.first.mockResolvedValueOnce(mockWallet);
          trx.first.mockResolvedValueOnce(updatedWallet);

          return await cb(trx);
        },
      );

      const result = await service.withdraw('user-1', 300);

      expect(result.message).toBe('Withdrawal successful');
      expect(result.data.wallet.balance).toBe(700.0);
    });

    it('throws BadRequestException when amount is zero', async () => {
      await expect(service.withdraw('user-1', 0)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequestException when amount is negative', async () => {
      await expect(service.withdraw('user-1', -100)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequestException for insufficient funds', async () => {
      knex.transaction.mockImplementation(
        async <T>(cb: (trx: MockedKnexCallable) => Promise<T>): Promise<T> => {
          const trx = createTrxMock();
          trx.first.mockResolvedValueOnce(mockWallet);
          return await cb(trx);
        },
      );

      await expect(service.withdraw('user-1', 2000)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.withdraw('user-1', 2000)).rejects.toThrow(
        'Insufficient funds',
      );
    });

    it('throws BadRequestException when wallet not found', async () => {
      knex.transaction.mockImplementation(
        async <T>(cb: (trx: MockedKnexCallable) => Promise<T>): Promise<T> => {
          const trx = createTrxMock();
          trx.first.mockResolvedValueOnce(undefined);
          return await cb(trx);
        },
      );

      await expect(service.withdraw('user-999', 100)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('transfer', () => {
    const toWallet: Wallet = {
      id: 'wallet-2',
      user_id: 'user-2',
      balance: 500.0,
      currency: 'NGN',
      created_at: new Date('2025-01-01'),
      updated_at: new Date('2025-01-01'),
    };

    it('successfully transfers between wallets', async () => {
      const updatedFromWallet = {
        ...mockWallet,
        balance: 800.0,
        updated_at: new Date('2025-01-02'),
      };

      knex.transaction.mockImplementation(
        async <T>(cb: (trx: MockedKnexCallable) => Promise<T>): Promise<T> => {
          const trx = createTrxMock(updatedFromWallet);

          // Mock sequence: fromWallet, toWallet, updatedFromWallet
          trx.first.mockResolvedValueOnce(mockWallet);
          trx.first.mockResolvedValueOnce(toWallet);
          trx.first.mockResolvedValueOnce(updatedFromWallet);

          return await cb(trx);
        },
      );

      const result = await service.transfer('user-1', 'user-2', 200);

      expect(result.message).toBe('Transfer successful');
      expect(result.data.wallet.balance).toBe(800.0);
    });

    it('throws BadRequestException when amount is zero', async () => {
      await expect(service.transfer('user-1', 'user-2', 0)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequestException when amount is negative', async () => {
      await expect(service.transfer('user-1', 'user-2', -50)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequestException when transferring to self', async () => {
      await expect(service.transfer('user-1', 'user-1', 100)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.transfer('user-1', 'user-1', 100)).rejects.toThrow(
        'Cannot transfer to self',
      );
    });

    it('throws BadRequestException when sender wallet not found', async () => {
      knex.transaction.mockImplementation(
        async <T>(cb: (trx: MockedKnexCallable) => Promise<T>): Promise<T> => {
          const trx = createTrxMock();
          trx.first.mockResolvedValueOnce(undefined);
          return await cb(trx);
        },
      );

      await expect(service.transfer('user-999', 'user-2', 100)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.transfer('user-999', 'user-2', 100)).rejects.toThrow(
        'Sender wallet not found',
      );
    });

    it('throws BadRequestException when recipient wallet not found', async () => {
      knex.transaction.mockImplementation(
        async <T>(cb: (trx: MockedKnexCallable) => Promise<T>): Promise<T> => {
          const trx = createTrxMock();
          trx.first.mockResolvedValueOnce(mockWallet);
          trx.first.mockResolvedValueOnce(undefined);
          return await cb(trx);
        },
      );

      await expect(service.transfer('user-1', 'user-999', 100)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.transfer('user-1', 'user-999', 100)).rejects.toThrow(
        'Recipient wallet not found',
      );
    });

    it('throws BadRequestException for insufficient funds', async () => {
      knex.transaction.mockImplementation(
        async <T>(cb: (trx: MockedKnexCallable) => Promise<T>): Promise<T> => {
          const trx = createTrxMock();
          trx.first.mockResolvedValueOnce(mockWallet);
          trx.first.mockResolvedValueOnce(toWallet);
          return await cb(trx);
        },
      );

      await expect(service.transfer('user-1', 'user-2', 2000)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.transfer('user-1', 'user-2', 2000)).rejects.toThrow(
        'Insufficient funds',
      );
    });
  });
});
