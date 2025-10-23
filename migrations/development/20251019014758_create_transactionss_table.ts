import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('transactions', (table) => {
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
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('transactions');
}
