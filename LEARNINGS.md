# Learnings

Use this file to record durable lessons about the project, environment, tooling,
or workflow that future agents should know before making changes.

- `bun run build` with the current Next.js setup compiles routes but reports
  "Skipping validation of types". Run `bunx tsc --noEmit` when type safety needs
  to be verified.

- NextAuth v4 logs `[next-auth][error][CLIENT_FETCH_ERROR]` to the console via its
  own internal logger whenever a client-side fetch to `/api/auth/session` fails.
  This is expected when offline and is cosmetic (the fetch returns `null`; the app
  falls back to the cached offline identity). It cannot be silenced through public
  `SessionProvider` props: `refetchWhenOffline={false}` only gates the interval
  poll (which this app doesn't use), while the initial mount fetch and the
  window-focus refetch still run unconditionally. The suppressible path
  (`setLogger` in `next-auth/utils/logger`) is not exposed by NextAuth's package
  `exports` map. Do not attempt to patch NextAuth to hide it.

- NextAuth's client-side `status === "unauthenticated"` is **not** a reliable
  signal that the user logged out. Because `getSession()` swallows fetch errors
  and resolves `null`, a transient session-fetch failure while online also
  reports `unauthenticated`. Never wipe the local PowerSync mirror based on
  `unauthenticated` + `navigator.onLine` — `navigator.onLine` only proves a
  network interface exists, not that the session endpoint responded. Wipe local
  data only from (a) an explicit user action (the sign-out button clears the
  mirror via `db.disconnectAndClear()` before calling `signOut`) or (b) a real
  user switch, which the provider detects as `authenticated` with a cached user
  id that differs from the session user id — that combination can only happen
  after a server-confirmed different account signs in, so it is safe to clear.

- For the offline-first upload path, the PowerSync backend connector and the
  upload route must agree on which HTTP statuses are retryable. Returning 2xx
  for auth/infrastructure failures makes the connector call
  `transaction.complete()`, which erases the local queue and loses offline
  writes. Keep non-2xx (401/503) for retryable failures so the connector throws
  and PowerSync retries the transaction; reserve 2xx for permanently invalid
  operations the client can drop.

- `bun run test` currently exits nonzero because of pre-existing failures, not
  because of a harness-only issue. As of the store/IndexedDB bridge the baseline
  is `4 failed | 12 passed` test files and `14 failed | 125 passed` tests. The
  failing files are `tests/lib/create-idea.test.ts` (asserts an old raw-SQL
  `insertIdea` signature), `tests/integration/auth-callbacks.test.ts`, `tests/integration/
  auth-flow.test.ts`, and `tests/integration/ideas-api.test.ts` (mock the Effect
  layer as plain return values, which the real `db/*` functions no longer are).
  A jsdom/lexical `selectionTarget.getBoundingClientRect is not a function` is
  reported as an unhandled error from `tests/components/idea-card.test.tsx` but
  that file's tests still pass. Compare the "Tests" count, not the exit code.

- `AGENTS.md` is stale about the stack and tooling. It says the app uses Neon
  serverless PostgreSQL and lists only four package scripts, but `db/schema.ts`
  and `db/client.ts` are Drizzle + libSQL/Turso, and `package.json` also defines
  `test` (Vitest), `test:e2e` (Playwright), `db:generate|migrate|push|studio`, and
  `doctor`. `bunx tsc --noEmit` also reports pre-existing type errors in `tests/`
  (Effect mock shapes and `fetch` mocks missing `preconnect`); app code type
  checks clean. Trust `package.json` and the actual source over `AGENTS.md` for
  stack facts, and do not "fix" the test files as part of unrelated changes.

- Zustand v5 `persist` + `createJSONStorage` type contract: the generic on
  `createJSONStorage<PersistedState>` is the *partialized* (inner) state, but
  at runtime persist wraps it into `{ state, version }` before calling the
  underlying storage, and reads it back expecting that wrapped shape. With a
  custom `StateStorage`, `setItem` receives the JSON string of `{ state,
  version }` (must parse `.state.prefs`), and `getItem` must return the
  stringified `{ state: { prefs }, version: 0 }` shape or hydration silently
  no-ops. `createJSONStorage(() => ...)` is SSR-safe (try/catch around
  `getStorage()`), and hydration is synchronous for sync storage.

- `drizzle-orm` is pinned to `1.0.0-rc.5-ab785fc`, whose `drizzle-orm/neon-http`
  `drizzle()` signature differs from the v0.x docs: the connection
  string/client is the first positional arg (no two-arg `drizzle(client,
  { schema })`), and the schema goes in the config under `relations:
  defineRelations(schema)` (the `schema` key was removed from
  `DrizzlePgConfig`). `db/schema.ts` exports tables only, so
  `defineRelations(schema)` (or `buildRelations(schema, {...})`) must be used
  to produce the `TableRelationalConfig` map the RC expects.

- `Effect.provide(effect, AppLayer)` rebuilds the layer on every call, so a
  `Layer.sync`/`Layer.succeed` closure is a *new* instance each time. State that
  must be process-wide (a zustand subscription, a write lock) belongs at module
  scope, not in the layer factory: `hooks/use-effect.ts` builds `AppLayer` on
  every effect run, so a per-instance `started` flag registers a fresh
  subscription each time. `lib/outbox/ideas-cache-controller.ts` keeps its
  subscription handle at module scope and serialises writes with a module-level
  `Semaphore.makeUnsafe(1)` (`Semaphore` is a namespace export of `effect`; the
  `makeUnsafe` variant is synchronous and usable at module load).

- For a store-to-IndexedDB bridge, "skip the flush if one is already running"
  breaks any reader that assumes "flush, then read": the reader gets a stale
  snapshot. Make a second flush *wait* for the in-flight one (semaphore or
  promise latch) and keep messages queued until they are written, acking only
  the seq values that were actually persisted. Dexie writes inside one
  transaction must stay sequential — the `no-await-in-loop` rule is disabled on
  purpose in `lib/outbox/ideas-cache.ts` because `replace` deletes then writes,
  and parallelising would drop the ordering guarantee.

- `oxlint` honours `// oxlint-disable <rule>` / `// oxlint-enable <rule>` block
  comments (and `// oxlint-disable-next-line`); `// eslint-disable-next-line`
  with a rule path such as `eslint/no-await-in-loop` is ignored.

- Capture is now local-first end to end: `saveIdeaLocally` writes only the
  `db.outbox` row, the store's `upsert(local)` message is what makes the
  controller write `db.ideas`, and the controller calls `requestOutboxSync()`
  after a local idea lands on disk. Because `db.ideas` may lag the outbox,
  `hydrate` reconstructs a missing row with `outboxItemToIdea` — never assume a
  non-empty `db.outbox` implies a matching `db.ideas` row.

- `Effect.repeat` with an unbounded schedule never completes, and completing is
  what clears a `try/finally`-based guard: `Schedule.concat(Schedule.recurs(n),
  Schedule.exponential(...))` passed to `Effect.repeat` re-ran the sync POST
  forever, so `syncing` stayed `true` and no later sync ever started. Use
  `Effect.retry({ schedule: Schedule.exponential(...), times: n })` for bounded
  backoff, and remember `Effect.retry` only retries *typed failures* — a
  "try again" result must be promoted to a failure first.

- `/api/ideas` POST now accepts `client_id` (UUID-validated) so an offline
  capture keeps its id when it reaches Turso; a colliding id falls back to a
  server-generated one. The id is still validated, so the client cannot pin an
  arbitrary string as a primary key.
