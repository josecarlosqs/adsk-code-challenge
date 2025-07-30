import express, { Request, Response, NextFunction } from 'express';
import { env } from './config/env';
import { expressConfig } from './config/app';
import { routes } from './routes';

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


app.listen(env.PORT, env.HOST, () => {
  console.log(`📚 BookWorm API exposed @ http://${env.HOST}:${env.PORT}`);
});
