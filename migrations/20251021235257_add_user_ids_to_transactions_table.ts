import { Knex } from 'knex';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('transactions', (table) => {
    table.uuid('from_user_id').nullable();
    table.uuid('to_user_id').nullable();
    table
      .foreign('from_user_id')
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');
    table
      .foreign('to_user_id')
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('transactions', (table) => {
    table.dropForeign(['from_user_id']);
    table.dropForeign(['to_user_id']);
    table.dropColumn('from_user_id');
    table.dropColumn('to_user_id');
  });
}
