import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('cached_results', (table) => {
    table.bigInteger('key').index();
    table.bigInteger('book_id').notNullable();
    table.primary(['key', 'book_id']);
    table.foreign('book_id').references('books.id');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('books').dropTable('users');
}
