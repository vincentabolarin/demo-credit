import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const exists = await knex.schema.hasTable('wallets');
  if (!exists) {
    await knex.schema.createTable('wallets', (table) => {
      table.uuid('id').primary();
      table
        .uuid('user_id')
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE');
      table.decimal('balance', 30, 8).notNullable().defaultTo(0);
      table.string('currency', 3).notNullable().defaultTo('NGN');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.unique(['user_id']);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('wallets');
}
