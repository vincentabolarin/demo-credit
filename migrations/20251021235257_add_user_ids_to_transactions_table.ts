import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasFrom = await knex.schema.hasColumn('transactions', 'from_user_id');
  const hasTo = await knex.schema.hasColumn('transactions', 'to_user_id');

  await knex.schema.alterTable('transactions', (table) => {
    if (!hasFrom) {
      table.uuid('from_user_id').nullable();
      table
        .foreign('from_user_id')
        .references('id')
        .inTable('users')
        .onDelete('SET NULL');
    }
    if (!hasTo) {
      table.uuid('to_user_id').nullable();
      table
        .foreign('to_user_id')
        .references('id')
        .inTable('users')
        .onDelete('SET NULL');
    }
  });
}

export async function down(knex: Knex): Promise<void> {
  const hasFrom = await knex.schema.hasColumn('transactions', 'from_user_id');
  const hasTo = await knex.schema.hasColumn('transactions', 'to_user_id');

  await knex.schema.alterTable('transactions', (table) => {
    if (hasFrom) {
      table.dropForeign(['from_user_id']);
      table.dropColumn('from_user_id');
    }
    if (hasTo) {
      table.dropForeign(['to_user_id']);
      table.dropColumn('to_user_id');
    }
  });
}
