# 📚 BookWorm API

## Requisites

- Nodejs@LTS
- Docker
- docker-compose

## Setup

- Clone repo
- Populate `.env` with the indicated variables in ``.env.template`
- Run `docker-compose up` to run required services
- Run `npm i` to install required dependencies
- Run `npm run db:migrate` to create the database schema

## Development Run

- run `npm run dev`, this will run `nodemon`.

## Production Build & Run

- Run `npm run build`.
- Run `node dist/index.js`

## Exposed Endpoints

- `/search`:
  - Query parameters:
    - `q`: Search term. String. Required.
    - `page`: Result page. Numeric. Optional. Defaults to `1`

## Decisions Made

- We're basing our solution in caching the searchterm instead of doing a fulltext search query bc, this second option involves querying the database and the api again in order to search for new matches, not necesarily newer publications.
- We are using farmhash as a numeric hash for the cache key, this is bc storing a probably long and alfanumeric cache key as a index column on pgsql will reduce the index efficiency.
- Also hashing the same way the book result key to get a unique bigint as a safe storable column.
- Saving the hashed cache key in redis will decrease processor usage every time we want to excecute the search, this also allows to add a expiration time to the cache, considering the fact that `New books aren't added *that often*`, we will want to define a mont or a year as a TTL.
