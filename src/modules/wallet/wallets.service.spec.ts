import knex, { Knex } from 'knex';
import { WalletsService } from './wallets.service';
import { Wallet } from './interfaces/wallets.interface';

describe('WalletsService (unit/in-memory)', () => {
  let db: Knex;
  let svc: WalletsService;

  beforeAll(async () => {
    db = knex({
      client: 'sqlite3',
      connection: { filename: ':memory:' },
      useNullAsDefault: true,
    });
    await db.migrate.latest({ directory: '../../migrations' });
    await db.seed.run({ directory: '../../seeds' });
    svc = new WalletsService(db);
  });

  afterAll(async () => {
    await db.destroy();
  });

  it('fund increases wallet balance', async () => {
    // use seeded user 1
    const initial = await db<Wallet>('wallets').where({ user_id: '1' }).first();
    await svc.fund('1', 500);
    const updated = await db<Wallet>('wallets').where({ user_id: '1' }).first();
    expect(Number(updated?.balance)).toBeGreaterThan(Number(initial?.balance));
  });

  it('withdraw reduces balance and prevents overdraft', async () => {
    await db('wallets').where({ user_id: 2 }).update({ balance: 200 });
    await svc.withdraw('2', 100);
    const w1 = await db<Wallet>('wallets').where({ user_id: '2' }).first();
    expect(Number(w1?.balance)).toBeCloseTo(100);

    await expect(svc.withdraw('2', 1000)).rejects.toThrow();
  });

  it('transfer is atomic', async () => {
    await db('wallets').where({ user_id: 1 }).update({ balance: 1000 });
    await db('wallets').where({ user_id: 2 }).update({ balance: 100 });

    const res = await svc.transfer('1', '2', 300);
    expect(Number(res.data.wallet.balance)).toBeCloseTo(700);
  });
});
