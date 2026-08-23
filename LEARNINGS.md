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

- `bun run test` currently exits nonzero because of a pre-existing uncaught
  lexical/jsdom exception in `tests/components/idea-card.test.tsx`. 115 tests
  pass; the failure is a harness issue, not a test failure. Do not treat exit
  code 1 as "tests failing" — compare the "Tests" count instead.

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
