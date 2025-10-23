import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { BlacklistService } from '../blacklist/blacklist.service';
import { createTestingModule } from '../../../test/common/test-utils';
import { KNEX_CONNECTION } from '../../../src/config/knex.provider';
import bcrypt from 'bcrypt';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import type { UserWithoutPassword } from './interfaces/user.interface';
import {
  createKnexCallableMock,
  createTrxMock,
  MockedKnexCallable,
} from 'test/common/knex-callable-mock';

describe('AuthService (unit)', () => {
  let service: AuthService;
  let knex: MockedKnexCallable;
  type JwtMockType = { sign: jest.Mock<string, [any?]> };
  type BlacklistMockType = {
    checkBlacklistStatus: jest.Mock<Promise<unknown>, [any?]>;
  };
  let jwtMock: JwtMockType;
  let blacklistMock: BlacklistMockType;
  let resetMocks: () => void;

  beforeEach(async () => {
    jwtMock = { sign: jest.fn(() => 'mock.jwt.token') };
    blacklistMock = {
      checkBlacklistStatus: jest
        .fn<Promise<unknown>, [any?]>()
        .mockResolvedValue({ 'mock-response': true, data: {} }),
    };

    const knexMock = createKnexCallableMock();

    const { module, resetMocks: rm } = await createTestingModule([
      AuthService,
      { provide: KNEX_CONNECTION, useValue: knexMock },
      { provide: JwtService, useValue: jwtMock },
      { provide: BlacklistService, useValue: blacklistMock },
    ]);

    resetMocks = rm;
    knex = module.get<MockedKnexCallable>(KNEX_CONNECTION);
    service = module.get(AuthService);

    knex.transaction.mockImplementation(
      async <T>(cb: (trx: MockedKnexCallable) => Promise<T>): Promise<T> => {
        const trx = createTrxMock({
          id: 'generated-id',
          email: 'new@example.com',
          first_name: 'John',
          last_name: 'Doe',
          phone: '08010000000',
          created_at: new Date(),
          updated_at: new Date(),
        });
        return await cb(trx);
      },
    );
  });

  afterEach(() => {
    resetMocks();
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('registers a new user and creates a wallet', async () => {
      knex.where.mockReturnThis();
      knex.first.mockResolvedValueOnce(undefined);

      const res = await service.register({
        firstName: 'John',
        lastName: 'Doe',
        email: 'new@example.com',
        phone: '08010000000',
        password: 'Password!234',
      });

      expect(res).toHaveProperty('message', 'Registration successful');
      expect(res.data).toBeDefined();
      expect(res.data.accessToken).toBe('mock.jwt.token');
      expect(jwtMock.sign).toHaveBeenCalledTimes(1);
      expect(knex.transaction).toHaveBeenCalled();
    });

    it('throws ConflictException when user already exists', async () => {
      knex.where.mockReturnThis();
      knex.first.mockResolvedValueOnce({
        id: 'existing-id',
        email: 'existing@example.com',
      });

      await expect(
        service.register({
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'existing@example.com',
          phone: '08020000000',
          password: 'Password!234',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('throws InternalServerErrorException when blacklist response indicates blocked', async () => {
      blacklistMock.checkBlacklistStatus.mockResolvedValueOnce({
        'mock-response': false,
        data: { karma_identity: true, reason: 'fraud' },
      });

      knex.where.mockReturnThis();
      knex.first.mockResolvedValueOnce(undefined);

      await expect(
        service.register({
          firstName: 'Evil',
          lastName: 'User',
          email: 'evil@example.com',
          phone: '08099999999',
          password: 'badpassword',
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('validateUser', () => {
    it('returns user object when credentials match', async () => {
      const hashed = await bcrypt.hash('Password!234', 10);
      knex.where.mockReturnThis();
      knex.first.mockResolvedValueOnce({
        id: 'u1',
        email: 'u1@example.com',
        password: hashed,
      });

      const user = await service.validateUser('u1@example.com', 'Password!234');
      expect(user).toBeTruthy();
      expect(user?.email).toBe('u1@example.com');
    });

    it('returns null when user not found', async () => {
      knex.where.mockReturnThis();
      knex.first.mockResolvedValueOnce(undefined);

      const user = await service.validateUser(
        'missing@example.com',
        'Password!234',
      );
      expect(user).toBeNull();
    });

    it('returns null when password mismatch', async () => {
      const hashed = await bcrypt.hash('CorrectPassword', 10);
      knex.where.mockReturnThis();
      knex.first.mockResolvedValueOnce({
        id: 'u2',
        email: 'u2@example.com',
        password: hashed,
      });

      const user = await service.validateUser(
        'u2@example.com',
        'WrongPassword',
      );
      expect(user).toBeNull();
    });
  });

  describe('login', () => {
    it('returns token and user DTO when valid user provided', () => {
      const userWithoutPassword: UserWithoutPassword = {
        id: 'u3',
        email: 'u3@example.com',
        first_name: 'First',
        last_name: 'Last',
        phone: '0812345678',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const res = service.login(userWithoutPassword);
      expect(res).toHaveProperty('message', 'Login successful');
      expect(res.data).toBeDefined();
      expect(res.data.accessToken).toBe('mock.jwt.token');
      expect(jwtMock.sign).toHaveBeenCalledTimes(1);
    });
  });
});
