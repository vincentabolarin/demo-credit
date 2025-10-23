import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const exists = await knex.schema.hasTable('transactions');
  if (!exists) {
    await knex.schema.createTable('transactions', (table) => {
      table.uuid('id').primary();
      table.string('reference', 255).notNullable().unique();
      table
        .uuid('from_wallet_id')
        .nullable()
        .references('id')
        .inTable('wallets')
        .onDelete('SET NULL');
      table
        .uuid('to_wallet_id')
        .nullable()
        .references('id')
        .inTable('wallets')
        .onDelete('SET NULL');
      table.decimal('amount', 30, 8).notNullable();
      table.enum('type', ['FUNDING', 'TRANSFER', 'WITHDRAWAL']).notNullable();
      table.json('meta').nullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('transactions');
}
