import { env } from "../config/env";
import { redis } from "../connections/cache";
import { Book } from "../models/Book";
import type { BooksRepository, DatabaseBooksRepository } from "../repositories/BooksRepository";
import farmhash from 'farmhash'

export class BooksService {
  private cacheKeyPrefix: string;
  constructor(
    private remoteBooksRepo: BooksRepository,
    private localBooksRepo: DatabaseBooksRepository,
  ){
    this.cacheKeyPrefix = `BWCK:${this.remoteBooksRepo.PROVIDER_NAME}:${this.remoteBooksRepo.SORTING_FIELD}${this.remoteBooksRepo.SORTING_DIRECTION}${this.remoteBooksRepo.PAGE_SIZE}`;
  }
  public async search(query: string, page: number): Promise<Book[]> {
    const cacheKey = `${this.cacheKeyPrefix}:${page || 1}:${query}`,
          cachedKeyHash = await redis.get(cacheKey);

    let results!: Book[];

    if (cachedKeyHash) {
      results = await this.localBooksRepo.getByCachedResult(BigInt(cachedKeyHash));
      return results;
    }

    const hashedCacheKey = farmhash.fingerprint64signed(cacheKey);

    results = await this.remoteBooksRepo.search(query, page);

    if (results.length > 0) {
      await this.localBooksRepo.registerCachedResult(hashedCacheKey, results);
      await redis.set(cacheKey, hashedCacheKey.toString());
      await redis.expire(cacheKey, env.CACHED_RESULT_DEFAULT_TTL);
    }

    return results;

  }
}
