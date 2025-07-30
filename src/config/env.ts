import { host, cleanEnv, str, port, num } from "envalid";
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = cleanEnv(process.env, {
  NODE_ENV: str({
    default: 'development',
    desc: 'API environment',
    choices: ['development', 'production']
  }),

  HOST: host({
    default: 'localhost',
    desc: 'API Host',
  }),

  PORT: port({
    default: 3000,
    desc: 'API Port',
  }),

  DB_HOST: host({
    devDefault: '127.0.0.1',
    desc: 'Database Host'
  }),
  DB_PORT: port({
    default: 5432,
    desc: 'Database port'
  }),
  DB_USER: str({
    desc: 'Database user'
  }),
  DB_PASSWORD: str({
    desc: 'Database password'
  }),
  DB_NAME: str({
    desc: 'Database name'
  }),

  REDIS_HOST: host({
    desc: 'Redis host'
  }),
  REDIS_PORT: port({
    devDefault: 6379,
    desc: 'Redis port'
  }),
  REDIS_DB: num({
    default: 0,
    desc: 'Redis database to use (min=0 max=32)'
  }),
});
