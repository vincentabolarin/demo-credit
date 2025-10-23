import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasUserId = await knex.schema.hasColumn('wallets', 'user_id');
  if (hasUserId) {
    await knex.schema.alterTable('wallets', (table) => {
      table.dropForeign('user_id', 'wallets_user_id_foreign');
      table.dropUnique(['user_id']);
    });

    await knex.schema.alterTable('wallets', (table) => {
      table.uuid('user_id').alter();
    });

    await knex.schema.alterTable('wallets', (table) => {
      table
        .foreign('user_id', 'wallets_user_id_foreign')
        .references('id')
        .inTable('users')
        .onDelete('CASCADE');
      table.unique(['user_id']);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasUserId = await knex.schema.hasColumn('wallets', 'user_id');
  if (hasUserId) {
    await knex.schema.alterTable('wallets', (table) => {
      table.dropForeign('user_id', 'wallets_user_id_foreign');
      table.dropUnique(['user_id']);
      table.integer('user_id').alter();
      table
        .foreign('user_id', 'wallets_user_id_foreign')
        .references('id')
        .inTable('users')
        .onDelete('CASCADE');
      table.unique(['user_id']);
    });
  }
}
