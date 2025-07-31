import http from 'node:http';
import express, {
  type NextFunction,
  type Request,
  type Response,
} from 'express';
import { expressConfig } from './config/app';
import { env } from './config/env';
import { closeCacheConnection, testCacheConnection } from './connections/cache';
import {
  closeDatabaseConnection,
  testDatabaseConnection,
} from './connections/knex';
import { routes } from './routes';

const app = express();

expressConfig(app);

app.use(routes);

app.use((_req: Request, res: Response, _next) => {
  return res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Error',
  });
});

export const server = http.createServer(app);
(async () => {
  const validCacheConection = await testCacheConnection();
  const validDatabaseConection = await testDatabaseConnection();

  if (validCacheConection && validDatabaseConection) {
    server.listen(env.PORT, env.HOST, () => {
      console.log(`📚 BookWorm API exposed @ http://${env.HOST}:${env.PORT}`);
    });
  }
})();

const shutdown = async () => {
  try {
    await closeCacheConnection();
    await closeDatabaseConnection();
  } catch (err) {
    console.error('Unable to close some connections:', err);
  }

  server.close((err) => {
    if (err) {
      process.exit(1);
    }
    process.exit(0);
  });

  setTimeout(() => {
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('SIGHUP', shutdown);
