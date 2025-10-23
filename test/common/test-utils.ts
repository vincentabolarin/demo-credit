import { Provider } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { KNEX_CONNECTION } from '../../src/config/knex.provider';

export type MockedKnex = {
  where: jest.Mock<MockedKnex, [any?]>;
  andWhere: jest.Mock<MockedKnex, [any?]>;
  orWhere: jest.Mock<MockedKnex, [any?]>;
  orWhereRaw: jest.Mock<MockedKnex, [string, any[]?]>;
  first: jest.Mock<Promise<any>, [any?]>;
  insert: jest.Mock<MockedKnex, [any?]>;
  update: jest.Mock<MockedKnex, [any?]>;
  del: jest.Mock<MockedKnex, [any?]>;
  count: jest.Mock<Promise<any>, [any?]>;
  orderBy: jest.Mock<MockedKnex, [any?, any?]>;
  limit: jest.Mock<MockedKnex, [number?]>;
  offset: jest.Mock<MockedKnex, [number?]>;
  select: jest.Mock<MockedKnex, [any?]>;
  leftJoin: jest.Mock<MockedKnex, [any?]>;
  clone: jest.Mock<MockedKnex, []>;
  transaction: jest.Mock<Promise<any>, [(trx: MockedKnex) => Promise<any>]>;
  raw: jest.Mock<unknown, [unknown]>;
  fn: {
    now: jest.Mock<Date, []>;
  };
};

export function createKnexMock(): MockedKnex {
  const mock = {
    where: undefined,
    andWhere: undefined,
    orWhere: undefined,
    first: undefined,
    insert: undefined,
    update: undefined,
    del: undefined,
    count: undefined,
    orderBy: undefined,
    limit: undefined,
    offset: undefined,
    select: undefined,
    leftJoin: undefined,
    transaction: undefined,
    raw: undefined,
    fn: undefined,
  } as unknown as MockedKnex;

  mock.where = jest.fn<MockedKnex, [any?]>(() => mock);
  mock.andWhere = jest.fn<MockedKnex, [any?]>(() => mock);
  mock.orWhere = jest.fn<MockedKnex, [any?]>(() => mock);
  mock.orWhereRaw = jest.fn<MockedKnex, [string, any[]?]>(() => mock);
  mock.insert = jest.fn<MockedKnex, [any?]>(() => mock);
  mock.update = jest.fn<MockedKnex, [any?]>(() => mock);
  mock.del = jest.fn<MockedKnex, [any?]>(() => mock);
  mock.orderBy = jest.fn<MockedKnex, [any?, any?]>(() => mock);
  mock.limit = jest.fn<MockedKnex, [number?]>(() => mock);
  mock.offset = jest.fn<MockedKnex, [number?]>(() => mock);
  mock.select = jest.fn<MockedKnex, [any?]>(() => mock);
  mock.leftJoin = jest.fn<MockedKnex, [any?]>(() => mock);
  mock.clone = jest.fn(() => mock);
  mock.first = jest.fn<Promise<unknown>, [any?]>().mockResolvedValue(undefined);
  mock.count = jest
    .fn<Promise<{ count: number }[]>, [any?]>()
    .mockResolvedValue([{ count: 0 }]);
  mock.raw = jest.fn<unknown, [unknown]>((val: unknown) => val);
  mock.fn = {
    now: jest.fn<Date, []>(() => new Date()),
  };

  mock.transaction = jest
    .fn<Promise<unknown>, [(trx: MockedKnex) => Promise<unknown>]>()
    .mockImplementation(async (callback) => {
      const result = await callback(mock);
      return result;
    });

  return mock;
}

export async function createTestingModule(providers: Provider[]): Promise<{
  module: TestingModule;
  knexMock: MockedKnex;
  resetMocks: () => void;
}> {
  const knexMock = createKnexMock();

  const module: TestingModule = await Test.createTestingModule({
    providers: [{ provide: KNEX_CONNECTION, useValue: knexMock }, ...providers],
  }).compile();

  const resetMocks = () => {
    jest.clearAllMocks();
    const fresh = createKnexMock();
    Object.keys(fresh).forEach((k) => {
      // @ts-expect-error due to type
      knexMock[k as keyof MockedKnex] = fresh[k as keyof MockedKnex];
    });
  };

  return { module, knexMock, resetMocks };
}
