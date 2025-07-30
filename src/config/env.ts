import { host, cleanEnv, str, port } from "envalid";
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
    devDefault: 'localhost',
    desc: 'API Host',
  }),

  PORT: port({
    default: 3000,
    desc: 'API Port',
  }),
});