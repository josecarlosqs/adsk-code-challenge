import axios from 'axios';
import farmhash from 'farmhash';
import type { Knex } from 'knex';
import { knex } from '../connections/knex';
import type { Book } from '../models/Book';

interface SearchResponse {
  docs: {
    key: string;
    title: string;
    author_name?: string[];
  }[];
}

export abstract class BooksRepository {
  public readonly PROVIDER_NAME!: string;
  public readonly SORTING_FIELD!: string;
  public readonly SORTING_DIRECTION!: string;
  public readonly PAGE_SIZE!: number;

  public abstract search(query: string, page?: number): Promise<Book[]>;
}

export class OpenLibraryBooksRepository implements BooksRepository {
  public readonly PROVIDER_NAME = 'OpenLibrary';
  public readonly SORTING_FIELD = 'new';
  public readonly SORTING_DIRECTION = '';
  public readonly PAGE_SIZE = 50;

  private readonly BASE_URL = 'https://openlibrary.org';

  public async search(query: string, page: number): Promise<Book[]> {
    try {
      const response = await axios.get<SearchResponse>(
        `${this.BASE_URL}/search.json`,
        {
          params: {
            q: `title:"${query}" OR author:"${query}"`,
            fields: 'title,author_name,key',
            limit: this.PAGE_SIZE,
            sort: this.SORTING_FIELD,
            page: page,
            lang: 'en',
          },
        },
      );

      if (!response.data || !response.data.docs) {
        return [];
      }

      const books: Book[] = response.data.docs.map((doc) => ({
        id: farmhash.fingerprint64signed(doc.key),
        title: doc.title,
        author: doc.author_name?.join(', ') || 'Unknown',
      }));

      return books;
    } catch (error) {
      console.error('OpenLibrary: Unable to connect', error);
      throw new Error('Unable to connect.');
    }
  }
}

export class DatabaseBooksRepository implements BooksRepository {
  public readonly PROVIDER_NAME = 'PgDatabase';
  public readonly SORTING_FIELD = '';
  public readonly SORTING_DIRECTION = '';
  public readonly PAGE_SIZE = -1;

  public async search(_: string): Promise<Book[]> {
    throw new Error('Not implemented');
  }

  public async getByCachedResult(key: bigint): Promise<Book[]> {
    try {
      const result = await knex('cached_results as cr')
        .where('cr.key', key.toString())
        .join('books as b', 'b.id', '=', 'cr.book_id')
        .select('b.id', 'b.title', 'b.author');

      return result;
    } catch (error) {
      console.error(error);
      throw new Error('Unable to check for cached results');
    }
  }

  public async registerCachedResult(key: bigint, books: Book[]) {
    try {
      await knex.transaction(async (trx: Knex.Transaction) => {
        await Promise.allSettled([
          await trx.insert(books).into('books').onConflict('id').ignore(),
          await trx
            .insert(
              books.map((book) => {
                return { key: key, book_id: book.id };
              }),
            )
            .into('cached_results')
            .onConflict(['key', 'book_id'])
            .ignore(),
        ]);
      });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
