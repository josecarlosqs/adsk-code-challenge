import type { Express } from "express"
import helmet from 'helmet';
import cors from 'cors';
import { corsOptions } from './cors';

export const expressConfig = function (app: Express) {
  app.use(cors(corsOptions));
  app.use(helmet());
}
