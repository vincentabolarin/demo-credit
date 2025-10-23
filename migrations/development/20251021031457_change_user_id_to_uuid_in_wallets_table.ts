import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('wallets', (table) => {
    table.dropForeign(['user_id']);
    table.dropUnique(['user_id']);
    table.uuid('user_id').alter();
    table
      .foreign('user_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table.unique(['user_id']);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('wallets', (table) => {
    table.dropForeign(['user_id']);
    table.dropUnique(['user_id']);
    table.integer('user_id').alter();
    table
      .foreign('user_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table.unique(['user_id']);
  });
}
