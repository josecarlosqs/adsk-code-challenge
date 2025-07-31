import Knex from 'knex';
import { env } from '../config/env';

export const knex = Knex({
  client: 'pg',
  connection: {
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    database: env.DB_NAME,
    password: env.DB_PASSWORD,
  },
  pool: { min: 0, max: 7 },
});

export async function testDatabaseConnection() {
  try {
    const response = await knex.queryBuilder().select(knex.raw('current_date'));
    return response.length > 0;
  } catch (e) {
    console.error(e);
    return false;
  }
}

export async function closeDatabaseConnection() {
  await knex.destroy();
}
