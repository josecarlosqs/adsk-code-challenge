import cors from 'cors';
import type { Express } from 'express';
import helmet from 'helmet';
import { corsOptions } from './cors';

export const expressConfig = (app: Express) => {
  app.use(cors(corsOptions));
  app.use(helmet());
};
