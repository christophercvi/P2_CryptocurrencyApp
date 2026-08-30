# P2_CryptocurrencyApp

CryptocurrencyApp is a responsive cryptocurrency market-intelligence interface built with React, Material UI, and Lightweight Charts, with the supplied high-fidelity mockups serving as the visual and interaction reference. It combines live CoinGecko market data, local account protection, SQLite-backed watchlists, interactive line and candlestick charts, and synchronized Dark, Light, and Device Default themes in a static frontend application.

> **Project scope:** This repository is a client-side educational application. Accounts and watchlists remain inside the current browser profile; it does not provide server-side identity, cross-device synchronization, or background price notifications.

## Project Team

| Team member | Name |
| --- | --- | --- |
| Member 1 — Team Lead | `Christopher Chan Vi` |
| Member 2 | `Samuel Cheng` |
| Member 3 | `Anmoldeep Sandhu` |

## Feature Summary

| Area | Implemented behavior |
| --- | --- |
| Authentication | Login, Create Account, logout, protected routes, optional remembered session, validation, Argon2id password hashing, and demo account setup |
| Persistence | SQLite Wasm database in OPFS when available, with an in-memory fallback for unsupported or non-isolated environments |
| Market overview | Global market cap, 24-hour volume, BTC dominance, active assets, top assets, trending assets, refresh timestamp, loading skeletons, and retry states |
| Discovery | Asset search by name or symbol, ranking options, market-cap ordering, gainers, losers, responsive desktop table, and compact mobile rows |
| Asset detail | Parameterized `/coin/:coinId` routes, price and market statistics, description, categories, official site link, watchlist action, and historical charts |
| Charts | `lightweight-charts-react-components` line and candlestick series with 24H, 7D, 30D, 1Y, and All range controls |
| Watchlist | Protected SQLite-backed saved assets, filtering, removal, alert preferences, target prices, and watchlist summary metrics |
| Portfolio view | Market-cap allocation visualization derived from saved assets; this is not a transaction or custody system |
| Themes | Dark is the initial default. Users can select Dark, Light, or Device Default; charts resolve to the same active palette |
| Resilience | API timeout handling, HTTP 429 retry/backoff, 404 handling, error boundary, retry controls, image fallbacks, and storage-mode feedback |
| Quality | TypeScript strict checking, Oxlint, Vitest, Testing Library, MSW, V8 coverage, and production build scripts |

## Technology Stack

| Layer | Technology |
| --- | --- |
| Application | React 19, TypeScript, Vite |
| Routing | React Router |
| Interface | Material UI and Emotion |
| Market data | Axios and the CoinGecko Keyless Public API |
| Charts | Lightweight Charts and `lightweight-charts-react-components` |
| Local database | `@sqlite.org/sqlite-wasm` with OPFS |
| Password protection | `hash-wasm` Argon2id |
| Tests | Vitest, Testing Library, user-event, MSW, jsdom, and V8 coverage |

## Application Architecture

The application separates UI, orchestration, persistence, and external-data responsibilities. React contexts provide authenticated-session state, shared market data, and the active user’s watchlist. Repositories isolate database queries from components, while a dedicated Web Worker owns SQLite initialization and execution. The CoinGecko service centralizes all external requests and normalizes errors before they reach the UI.

| Directory | Responsibility |
| --- | --- |
| `client/src/components` | Reusable market, chart, feedback, brand, and route-guard components |
| `client/src/contexts` | Authentication, live market data, and watchlist orchestration |
| `client/src/layouts` | Responsive application shell and branded authentication layout |
| `client/src/pages` | Login, account creation, overview, markets, details, watchlist, portfolio, and not-found routes |
| `client/src/repositories` | Account and watchlist persistence operations |
| `client/src/services` | CoinGecko request, retry, and error-normalization logic |
| `client/src/storage` | SQLite Web Worker and typed message client |
| `client/src/theme` | MUI tokens and Dark, Light, and Device Default resolution |
| `client/src/test` | MSW server, request handlers, setup polyfills, and reusable fixtures |
| `client/src/utils` | Currency, compact-number, percentage, and API-text formatting |

## Local Data Model

SQLite is initialized in a dedicated worker because the OPFS persistence APIs used by SQLite Wasm are designed for worker execution[^1]. The application attempts to open `/cryptocurrency-app.sqlite3` as an OPFS database and falls back to an in-memory SQLite database when the browser cannot provide OPFS or cross-origin isolation.

| Table | Key fields | Purpose |
| --- | --- | --- |
| `users` | `id`, normalized `email`, `display_name`, `password_hash`, `salt`, `password_algorithm` | Stores local browser accounts and encoded Argon2id hashes |
| `watchlist` | Composite key `user_id` + `coin_id`, asset metadata, `alert_enabled`, `alert_target` | Stores each local user’s watched assets and alert preferences |

The database stores no plaintext passwords. Account creation generates a unique cryptographic salt and an encoded Argon2id hash. The encoded form carries the algorithm parameters needed for verification and future migration. The current browser-oriented profile uses 19,456 KiB of memory, two iterations, parallelism one, and a 32-byte output. Argon2id is intentionally memory-hard and is the hybrid Argon2 variant recommended for password hashing in general-purpose applications[^2].

## Session Behavior

The session record contains only the public user identifier, email, and display name. Selecting **Remember me** stores this record in `localStorage`; otherwise it is stored in `sessionStorage`. Password hashes remain in SQLite and are never copied into either Web Storage location.

| Session choice | Storage | Lifetime |
| --- | --- | --- |
| Remember me disabled | `sessionStorage` | Current browser tab/session |
| Remember me enabled | `localStorage` | Persists until logout or browser data removal |

## Theme System

Dark Mode is the first-visit default to match the supplied mockups. The theme menu exposes three explicit preferences: **Dark**, **Light**, and **Device Default**. A saved preference is restored on future visits. Device Default resolves through `prefers-color-scheme` and listens for operating-system theme changes.

The resolved MUI palette also drives chart surfaces. Chart background, grid, scale borders, and labels update with the active theme, while positive and negative financial colors retain consistent semantic meaning and accessible contrast.

## CoinGecko Integration

The client calls the Keyless Public API at `https://api.coingecko.com/api/v3` without an API key, as documented by CoinGecko[^3]. The free keyless service is rate-limited on a shared basis, so the application limits request breadth, refreshes overview data periodically, and retries HTTP 429 responses with exponential backoff. It does not send demo-plan or pro-plan authentication headers.

| Endpoint | Application use |
| --- | --- |
| `/coins/markets` | Prices, ranks, market caps, 24-hour changes, volumes, seven-day sparklines, and API-provided logo URLs |
| `/global` | Global market cap, volume, dominance, and active cryptocurrency count |
| `/search/trending` | Trending asset cards |
| `/coins/categories` | Category data service and test coverage |
| `/coins/{id}` | Asset description, statistics, categories, official links, and logo variants |
| `/coins/{id}/market_chart` | Line-series historical prices |
| `/coins/{id}/ohlc` | Candlestick OHLC points |

All API errors are normalized into a `MarketApiError` with an optional HTTP status and retryability indicator. A 429 response presents rate-limit-specific guidance, a 404 is treated as non-retryable, and network/server failures offer retry controls.

## Chart Implementation

Both graph modes are composed with `lightweight-charts-react-components`, the project’s declarative React wrapper for Lightweight Charts[^4]. The line chart maps CoinGecko timestamps to ascending, unique second-based points. The candlestick chart maps OHLC arrays into open, high, low, and close records. Range controls share a single state model across both chart types.

| Range label | CoinGecko `days` value |
| --- | --- |
| 24H | `1` |
| 7D | `7` |
| 30D | `30` |
| 1Y | `365` |
| All | `max` |

## Responsive Design

The desktop layout uses a compact navigation rail, persistent top bar, data-dense tables, and multi-column metrics. Tablet and mobile breakpoints collapse controls, switch market tables to touch-friendly asset rows, provide a mobile drawer and bottom navigation, and avoid horizontal page scrolling. Authentication pages change from a split visual composition to a focused single-column form.

## Getting Started

### Prerequisites

Use **Node.js 24.19.0 or newer** and the version of **npm** included with the installed Node.js release. A Chromium-family browser provides the most predictable OPFS and cross-origin-isolation behavior.

```bash
npm install
npm run dev
```

Vite serves the application locally. Open the URL shown in the terminal. No CoinGecko key is required.

### Demo Account

| Field | Value |
| --- | --- |
| Email | `demo@cryptocurrency.app` |
| Password | `Demo123!` |

The demo account is created locally after SQLite initializes. It is intended only for exercising the interface.

## Available Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and create the production application and server bundles |
| `npm run start` | Start the built application in production mode |
| `npm run preview` | Preview the production frontend locally |
| `npm run check` | Run strict TypeScript checking without emission |
| `npm run lint` | Run Oxlint across `client/src` |
| `npm test` | Start Vitest in watch mode |
| `npm run test:run` | Run the test suite once |
| `npm run test:ui` | Open the Vitest visual test interface |
| `npm run coverage` | Run tests and generate text, JSON summary, and HTML coverage reports |
| `npm run format` | Format the project with Prettier |

When working on a memory-constrained machine, use `npm run test:run -- --maxWorkers=2` and `npm run coverage -- --maxWorkers=2`.

## Test Strategy

The suite combines pure unit tests, component interaction tests, repository tests with mocked database boundaries, and service tests backed by MSW. MSW intercepts requests at the network boundary rather than mocking Axios directly, which keeps request paths, query behavior, HTTP statuses, and response parsing under test[^5].

| Test area | Representative cases |
| --- | --- |
| Accounts | Encoded Argon2id creation, duplicate prevention, successful verification, invalid credentials, unsupported algorithms, and demo-account initialization |
| Watchlist repository | SQLite row mapping, add/update/remove statements, and price-alert persistence |
| CoinGecko service | Market/global/trending/category/detail/history/OHLC success, 429 retry exhaustion, and 404 behavior |
| Authentication UI | Validation, rejected login, remember-me login, strong-password rules, and account-creation navigation |
| Protected routing | Signed-out redirect and authenticated rendering |
| Discovery | Name/symbol search, gainers, losers, and watchlist actions |
| Charts | Default line series, candlestick switching, range changes, and theme-dependent chart surfaces |
| Themes | Dark initial default, saved Light preference, and Device Default persistence/resolution |

The current suite contains 51 passing tests across 15 files. The V8 report covers the selected critical modules at approximately 88% statements, 76% branches, 85% functions, and 91% lines. The generated HTML report is written to `coverage/index.html`.

## Production Build and Hosting Requirements

SQLite OPFS uses browser capabilities that require cross-origin isolation.[[1]](#reference-1) Development and production hosts should return these headers for the application document and worker:

```text
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: credentialless
```

Without cross-origin isolation, the application remains usable through the in-memory SQLite fallback, but local accounts and watchlists will not survive a reload. The app is a static frontend and does not require a custom API server.

## Security Considerations

Argon2id protects locally stored password verifiers, but client-side authentication cannot provide the same trust boundary as a server-authenticated application. A user with full access to the browser profile or developer tools controls the local runtime. Do not reuse a sensitive password in this demonstration app. For a production multi-user service, move identity verification, session issuance, rate limiting, audit logging, and recovery workflows to a hardened backend.

External text is rendered as plain text after HTML tags are removed. Coin images use API-provided URLs with a local visual fallback when an image is unavailable. No private CoinGecko key is included in the bundle.

## Known Limitations

| Limitation | Detail |
| --- | --- |
| Browser-local accounts | Accounts do not synchronize between devices or browser profiles |
| Static alerts | Alert targets are stored as preferences; no service runs while the page is closed |
| Keyless API quotas | Shared limits can produce temporary HTTP 429 responses |
| OPFS availability | Unsupported environments use a non-persistent in-memory database |
| Portfolio semantics | Allocation is illustrative and based on watchlist market caps, not owned quantities or trades |
| External image availability | CoinGecko logo URLs can be blocked by network policy; branded initials remain visible as a fallback |

## References

[^1]: https://github.com/sqlite/sqlite-wasm "SQLite Wasm repository and OPFS documentation"
[^2]: https://datatracker.ietf.org/doc/html/rfc9106 "RFC 9106: Argon2 Memory-Hard Function for Password Hashing and Proof-of-Work Applications"
[^3]: https://docs.coingecko.com/docs/keyless-public-api "CoinGecko Keyless Public API"
[^4]: https://www.npmjs.com/package/lightweight-charts-react-components "lightweight-charts-react-components package documentation"
[^5]: https://mswjs.io/docs/ "Mock Service Worker documentation"
