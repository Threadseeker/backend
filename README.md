# Threadseeker Backend

This is the open-sourced backend repository for Threadseeker. It's built with [Nitro](https://nitro.unjs.io/) and [Supabase](https://supabase.com/) as the database. We also use [Redis](https://redis.io/) as the cache.

## Build Setup

```bash
# install dependencies
$ pnpm install

# serve with hot reload at localhost:3000
$ pnpm dev

# build for production and launch server
$ pnpm build
$ pnpm start

# preview production build
$ pnpm preview
```

You could write your own `Dockerfile` to build a container for the app. The team recommends using [Zeabur](https://zeabur.com) for the fast and easy deployment.

## Environment Variables

Before running the app, you need to set certain environment variables in the `.env` file. The required variables are listed in the `.env.example` file.

## Database

Threadseeker uses [Supabase](https://supabase.com/) as its database. Create the tables described in the [database/readme.md](database/readme.md) file in your Supabase or PostgreSQL database for the app to work.

## Redis

For the data fetching task management and report `GET` endpoint, we use [Redis](https://redis.io/) as the cache. You may need to set up your own Redis instance or use [Upstash](https://upstash.com/).

If using Upstash, please update `utils/use-redis.ts` with this guide: [Store data in an Upstash Redis database.](https://unstorage.unjs.io/drivers/upstash#usage).

## Special Directories

### `routes/`

The `routes/` directory contains your application handlers. You can create subdirectories inside `routes/` dir to create nested handlers. The file name is the route path.

For more information, please refer to the [Nitro documentation](https://nitro.build/guide/routings).

### `api/`

The api/ directory is similar to routes/ with the only difference that routes inside it will be prefixed with /api/ for convenience.

For more information, please refer to the [Nitro documentation](https://nitro.build/guide/routings).

### `utils/`

This directory contains your application utils with auto import support. 

This app has several composable util for Redis connection, task management and Threads users and reports management.

For more information, please refer to the [Nitro documentation](https://nitro.build/guide/utils).

### `types/`

This directory contains your application types. `types/database.types.ts` is generated by Supabase ([guide here](https://supabase.com/docs/guides/api/rest/generating-types)).

### `middleware/`

Nitro Middleware are auto-registered within the `middleware/` directory. A middleware can modify the request before it is processed, not after.

For more information, please refer to the [Nitro documentation](https://nitro.build/guide/routing#middleware).

### `nitro.config.ts`

The nitro.config.ts file contains the configuration for Nitro.

For more information, please refer to the [Nitro documentation](https://nitro.build/guide/configuration).

### `openapi/`

This is a custom directory for the OpenAPI schema. You can add or modify the OpenAPI schema files in this directory, and import them in the the [route meta](https://nitro.build/guide/routing#route-meta).

> This directory is not a default directory of Nitro. To avoid messing the api controller files, we separate the OpenAPI schema files to this directory.

## API Documentation

In default, this app will generate the API documentation automatically. 

You can access the API documentation at `http://localhost:3000/_docs/_swagger`. The project enables the [experimental doc generation](https://nitro.build/config#openapi) and prerender the docs in production.

You could disable the doc generation in production by removing `production` config in `openAPI` section of `nitro.config.ts`. **If enabled, remember to protect your API docs endpoints.**

The real-world API documentation of Threadseeker is available at [doc.threadseeker.com](https://doc.threadseeker.com). We use Cloudflare Worker as a reverse proxy to protect the API docs without exposing the API host, and we also have the worker script open-sourced [here](https://github.com/Threadseeker/docs-proxy-worker).

## License

We use [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) for this project. See the [LICENSE](LICENSE) file for more information.
