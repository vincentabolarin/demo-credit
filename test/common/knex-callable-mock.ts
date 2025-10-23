import type { MockedKnex } from './test-utils';

export type MockedKnexCallable = (() => MockedKnexCallable) &
  MockedKnex &
  jest.Mock;

// Helper to create a callable Knex mock
export function createKnexCallableMock(): MockedKnexCallable {
  let knexMock = ((): MockedKnexCallable => {
    throw new Error('knexMock not initialized');
  }) as unknown as MockedKnexCallable;

  const whereMock = jest.fn<MockedKnexCallable, [any?]>(() => knexMock);
  const andWhereMock = jest.fn<MockedKnexCallable, [any?]>(() => knexMock);
  const orWhereMock = jest.fn<MockedKnexCallable, [any?]>(() => knexMock);
  const insertMock = jest.fn<MockedKnexCallable, [any?]>(() => knexMock);
  const updateMock = jest.fn<MockedKnexCallable, [any?]>(() => knexMock);
  const delMock = jest.fn<MockedKnexCallable, [any?]>(() => knexMock);
  const orderByMock = jest.fn<MockedKnexCallable, [any?, any?]>(() => knexMock);
  const limitMock = jest.fn<MockedKnexCallable, [number?]>(() => knexMock);
  const offsetMock = jest.fn<MockedKnexCallable, [number?]>(() => knexMock);
  const selectMock = jest.fn<MockedKnexCallable, [any?]>(() => knexMock);
  const leftJoinMock = jest.fn<MockedKnexCallable, [any?]>(() => knexMock);
  const rawMock = jest.fn<unknown, [unknown]>((val: unknown) => val);

  const firstMock = jest.fn<Promise<unknown>, [any?]>();
  firstMock.mockResolvedValue(undefined);

  const countMock = jest.fn<Promise<{ count: number }[]>, [any?]>();
  countMock.mockResolvedValue([{ count: 0 }]);

  const transactionMock = jest
    .fn<Promise<unknown>, [(trx: MockedKnex) => Promise<unknown>]>()
    .mockImplementation(async (callback) => {
      const trx = jest.fn(() => trx) as unknown as MockedKnex;
      Object.assign(trx, {
        insert: jest.fn(() => trx),
        where: jest.fn(() => trx),
        update: jest.fn(() => trx),
        first: jest.fn().mockResolvedValue({
          id: 'generated-id',
          email: 'generated@example.com',
          first_name: 'Gen',
          last_name: 'User',
          phone: '000',
          created_at: new Date(),
          updated_at: new Date(),
        }),
        raw: jest.fn((val: unknown) => val),
        fn: {
          now: jest.fn(() => new Date()),
        },
      });
      return callback(trx);
    });

  const fn = jest.fn<MockedKnexCallable, [any?]>(() => knexMock);

  (fn as unknown as MockedKnex).where = whereMock;
  (fn as unknown as MockedKnex).andWhere = andWhereMock;
  (fn as unknown as MockedKnex).orWhere = orWhereMock;
  (fn as unknown as MockedKnex).insert = insertMock;
  (fn as unknown as MockedKnex).update = updateMock;
  (fn as unknown as MockedKnex).del = delMock;
  (fn as unknown as MockedKnex).orderBy = orderByMock;
  (fn as unknown as MockedKnex).limit = limitMock;
  (fn as unknown as MockedKnex).offset = offsetMock;
  (fn as unknown as MockedKnex).select = selectMock;
  (fn as unknown as MockedKnex).leftJoin = leftJoinMock;
  (fn as unknown as MockedKnex).first = firstMock;
  (fn as unknown as MockedKnex).count = countMock;
  (fn as unknown as MockedKnex).raw = rawMock;
  (fn as unknown as MockedKnex).transaction = transactionMock;
  (fn as unknown as MockedKnex).fn = {
    now: jest.fn<Date, []>(() => new Date()),
  };

  knexMock = fn as unknown as MockedKnexCallable;

  return knexMock;
}

// Helper to create a callable transaction mock
export function createTrxMock(mockData?: unknown): MockedKnexCallable {
  let trxMock = ((): MockedKnexCallable => {
    throw new Error('trxMock not initialized');
  }) as unknown as MockedKnexCallable;

  const trxFn = jest.fn<MockedKnexCallable, [any?]>(() => trxMock);

  const defaultMockData = {
    id: 'generated-id',
    email: 'generated@example.com',
    first_name: 'Gen',
    last_name: 'User',
    phone: '000',
    created_at: new Date(),
    updated_at: new Date(),
  };

  (trxFn as unknown as MockedKnex).insert = jest.fn(() => trxMock);
  (trxFn as unknown as MockedKnex).where = jest.fn(() => trxMock);
  (trxFn as unknown as MockedKnex).update = jest.fn(() => trxMock);
  (trxFn as unknown as MockedKnex).first = jest
    .fn<Promise<unknown>, [any?]>()
    .mockResolvedValue(mockData || defaultMockData);
  (trxFn as unknown as MockedKnex).raw = jest.fn<unknown, [unknown]>(
    (val: unknown) => val,
  );
  (trxFn as unknown as MockedKnex).fn = {
    now: jest.fn<Date, []>(() => new Date()),
  };

  trxMock = trxFn as unknown as MockedKnexCallable;
  return trxMock;
}

export function createMockKnexChain(): Record<string, jest.Mock> {
  const chain: Record<string, jest.Mock> = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    orWhereRaw: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    count: jest.fn().mockReturnThis(),
    first: jest.fn(),
    leftJoin: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
  };

  chain.clone = jest.fn(() => chain);

  return chain;
}
