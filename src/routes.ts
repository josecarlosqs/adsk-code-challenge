import { Router } from 'express';
import { query } from 'express-validator';
import { searchBooks } from './controllers/bookController';

export const routes = Router();

routes.get(
  '/search',
  query('q').trim().escape().notEmpty(),
  query('page').isNumeric().optional(),
  searchBooks,
);
