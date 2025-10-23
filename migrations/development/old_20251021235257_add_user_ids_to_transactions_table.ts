import { Knex } from 'knex';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable('new_transactions', (table) => {
      table.uuid('id').primary();
      table.string('reference').notNullable().unique();
      table
        .uuid('from_wallet_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('wallets')
        .onDelete('SET NULL');
      table
        .uuid('to_wallet_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('wallets')
        .onDelete('SET NULL');
      table
        .uuid('from_user_id')
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL');
      table
        .uuid('to_user_id')
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL');
      table.decimal('amount', 30, 8).notNullable();
      table.enu('type', ['FUNDING', 'TRANSFER', 'WITHDRAWAL']).notNullable();
      table.json('meta').nullable();
      table.timestamps(true, true);
    })
    .then(() =>
      knex('new_transactions').insert(knex.select('*').from('transactions')),
    )
    .then(() => knex.schema.dropTable('transactions'))
    .then(() => knex.schema.renameTable('new_transactions', 'transactions'));
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .createTable('old_transactions', (table) => {
      table.uuid('id').primary();
      table.string('reference').notNullable().unique();
      table
        .uuid('from_wallet_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('wallets')
        .onDelete('SET NULL');
      table
        .uuid('to_wallet_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('wallets')
        .onDelete('SET NULL');
      table.decimal('amount', 30, 8).notNullable();
      table.enu('type', ['FUNDING', 'TRANSFER', 'WITHDRAWAL']).notNullable();
      table.json('meta').nullable();
      table.timestamps(true, true);
    })
    .then(() =>
      knex('old_transactions').insert(knex.select('*').from('transactions')),
    )
    .then(() => knex.schema.dropTable('transactions'))
    .then(() => knex.schema.renameTable('old_transactions', 'transactions'));
}
