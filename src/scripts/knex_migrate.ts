import { knex } from '../connections/knex';

knex.migrate.latest({
  extension: 'ts',
  directory: './src/migrations',
});
