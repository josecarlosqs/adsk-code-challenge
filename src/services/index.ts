import {
  DatabaseBooksRepository,
  OpenLibraryBooksRepository,
} from '../repositories/BooksRepository';
import { BooksService } from './BooksService';

export const booksService = new BooksService(
  new OpenLibraryBooksRepository(),
  new DatabaseBooksRepository(),
);
