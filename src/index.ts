import http from 'node:http';
import express, { Request, Response, NextFunction } from 'express';
import { env } from './config/env';
import { expressConfig } from './config/app';
import { routes } from './routes';
import { testCacheConnection, closeCacheConnection } from './config/cache';
import { testDatabaseConnection, closeDatabaseConnection } from './config/knex';

const app = express();

expressConfig(app);

app.use(routes);

app.use((_req: Request, res: Response, _next) => {
  return res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});


app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Error'
  });
});

const server = http.createServer(app);
(async function () {
  const validCacheConection = await testCacheConnection();
  const validDatabaseConection = await testDatabaseConnection();

  if (validCacheConection && validDatabaseConection) {
    server.listen(env.PORT, env.HOST, () => {
      console.log(`📚 BookWorm API exposed @ http://${env.HOST}:${env.PORT}`);
    });
  }
})()


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
