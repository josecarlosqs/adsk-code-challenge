import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable('books', function (table) {
      table.bigInteger('id').primary();
      table.string('title', 255).notNullable();
      table.text('author').notNullable();
    })
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('books').dropTable('users');
}

