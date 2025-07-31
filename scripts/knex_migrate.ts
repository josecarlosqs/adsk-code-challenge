import { knex } from "../src/connections/knex";

knex.migrate
  .latest({
    extension: 'ts',
    directory: './src/migrations'
  })
