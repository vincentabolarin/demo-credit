import { Knex } from 'knex';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

interface UserResponse {
  id: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  created_at?: Date;
  updated_at?: Date;
}

export async function seed(knex: Knex): Promise<void> {
  await knex('transactions').del();
  await knex('wallets').del();
  await knex('users').del();

  const password = await bcrypt.hash(
    process.env.SEED_PASSWORD || 'Password123!',
    10,
  );

  const users = [
    {
      id: uuidv4(),
      email: 'alice@maildrop.cc',
      password,
      first_name: 'Alice',
      last_name: 'Adamu',
      phone: '08010000001',
    },
    {
      id: uuidv4(),
      email: 'bob@maildrop.cc',
      password,
      first_name: 'Bob',
      last_name: 'Bodunde',
      phone: '08010000002',
    },
  ];

  await knex('users').insert(users);

  const created = await knex('users').select<UserResponse[]>('*');
  for (const u of created) {
    await knex('wallets').insert({
      id: uuidv4(),
      user_id: u.id,
      balance: 1000,
      currency: 'NGN',
    });
  }
}
