// tests/books.test.ts
import request from 'supertest';
import { server } from '../src/index';
import { DatabaseBooksRepository, OpenLibraryBooksRepository } from '../src/repositories/BooksRepository';
import { Book } from '../src/models/Book';

const inMemoryStore = new Map();

jest.mock('../src/repositories/BooksRepository');

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => {
    return {
      get: jest.fn((key: string) => Promise.resolve(inMemoryStore.get(key) || null)),
      set: jest.fn((key: string, value: string) => {
        inMemoryStore.set(key, value);
        return Promise.resolve('OK');
      }),
      expire: jest.fn((_key: string, _seconds: number) => {
        return Promise.resolve(1);
      }),
      ping: jest.fn(() => {
        return Promise.resolve('PONG');
      }),
    };
  });
});

jest.mock('../src/connections/knex', () => {
  return {
    testDatabaseConnection: jest.fn(() => {
      return Promise.resolve(true);
    }),
  };
});

const MockedRemoteBookRepository = OpenLibraryBooksRepository as jest.MockedClass<typeof OpenLibraryBooksRepository>;
const MockedLocalBookRepository = DatabaseBooksRepository as jest.MockedClass<typeof DatabaseBooksRepository>;

describe('GET /search', () => {

  beforeEach(() => {
    MockedRemoteBookRepository.mockClear();
    MockedLocalBookRepository.mockClear();
    MockedRemoteBookRepository.prototype.search.mockClear();
    inMemoryStore.clear();
  });

  it('debería devolver 400 si no se proporciona el query param "q"', async () => {
    const response = await request(server).get('/search');
    expect(response.status).toBe(400);
    expect(response.body.message).toContain("Invalid value for q query param");
  });

  it('debería devolver una lista de libros en una búsqueda exitosa (cache miss)', async () => {
    const mockBooks: Book[] = [
      { id: BigInt(1), title: 'The Cabin in the Woods', author: 'Scott Pearson' },
      { id: BigInt(2), title: 'Some Random Book', author: 'Arthur Woods' },
    ];

    MockedRemoteBookRepository.prototype.search.mockResolvedValue(mockBooks);

    const response = await request(server).get('/search?q=woods');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: mockBooks.map(book => ({title: book.title, author: book.author}))
    });

    expect(MockedRemoteBookRepository.prototype.search).toHaveBeenCalledWith('woods', undefined);
    expect(MockedRemoteBookRepository.prototype.search).toHaveBeenCalledTimes(1);
  });

  it('debería devolver resultados desde el caché en la segunda llamada (cache hit)', async () => {
    const mockBooks: Book[] = [
      { id: BigInt(1), title: 'The Cabin in the Woods', author: 'Scott Pearson' },
      { id: BigInt(2), title: 'Some Random Book', author: 'Arthur Woods' },
    ];

    MockedRemoteBookRepository.prototype.search.mockResolvedValue(mockBooks);
    MockedLocalBookRepository.prototype.search.mockResolvedValue([]);

    await request(server).get('/search?q=woods');
    expect(MockedRemoteBookRepository.prototype.search).toHaveBeenCalledTimes(1);

    MockedLocalBookRepository.prototype.getByCachedResult.mockResolvedValue(mockBooks);

    const response = await request(server).get('/search?q=woods');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: mockBooks.map(book => ({title: book.title, author: book.author}))
    });

    expect(MockedRemoteBookRepository.prototype.search).toHaveBeenCalledTimes(1);
    expect(MockedLocalBookRepository.prototype.getByCachedResult).toHaveBeenCalledTimes(1);
  });
});
