# Verified External Implementation References

## CoinGecko Keyless Public API

Source: https://docs.coingecko.com/docs/keyless-public-api

The keyless base URL is `https://api.coingecko.com/api/v3`. Requests require no API key or authentication header; `x-cg-demo-api-key` and `x-cg-pro-api-key` should not be sent. CoinGecko documents a dynamic shared-IP limit of approximately 10–30 calls per minute, with exponential backoff recommended for HTTP 429 responses. The relevant keyless endpoints are `/coins/markets`, `/coins/{id}`, `/coins/{id}/market_chart`, `/coins/{id}/ohlc`, `/coins/categories`, `/search/trending`, and `/global`. The `/coins/markets` response includes an `image` URL for each cryptocurrency, while the coin detail response provides `thumb`, `small`, and `large` image variants.

## Lightweight Charts React Components

Sources: https://www.npmjs.com/package/lightweight-charts-react-components and https://github.com/ukorvl/lightweight-charts-react-components

The verified package version is `2.6.0`, with `lightweight-charts >=5 <6` as a peer dependency. The declarative API exports `Chart`, `LineSeries`, `CandlestickSeries`, `TimeScale`, and `TimeScaleFitContentTrigger`. The chart container requires an explicit size through chart options or `containerProps`. Version 5 chart timestamps are seconds, must be unique, and must be sorted ascending.

## SQLite Wasm and OPFS

Sources: https://github.com/sqlite/sqlite-wasm and https://www.npmjs.com/package/@sqlite.org/sqlite-wasm

The verified package version is `3.53.0-build1`. Persistent Origin Private File System databases require SQLite initialization inside a Web Worker. The Vite development server must provide cross-origin isolation headers and exclude `@sqlite.org/sqlite-wasm` from dependency optimization. The documented persistent constructor is `new sqlite3.oo1.OpfsDb('/database.sqlite3')`, with an in-memory `sqlite3.oo1.DB(':memory:', 'ct')` fallback when OPFS is unavailable.

## Password Hashing

Source: installed `hash-wasm` package version `4.12.0`, `lib/argon2.ts` declarations.

`argon2id` accepts `password`, `salt`, `iterations`, `parallelism`, `memorySize` in KiB, `hashLength`, and `outputType: 'encoded'`. Encoded output stores the Argon2 variant, version, memory, iteration, parallelism, salt, and digest. `argon2Verify` verifies a password against the encoded string. The application parameters are Argon2id with 19,456 KiB memory, 2 iterations, parallelism 1, and 32 output bytes.
