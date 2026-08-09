# Mistakes

Use this file to record mistakes made while working on the project, including
the context, impact, and what should be done differently next time.

- **`resolveUserId` fallback never fired on offline capture (2026-08-09):** NextAuth's
  `getSession()` does *not* throw when the network fetch fails — it logs
  `CLIENT_FETCH_ERROR` internally and resolves with `null`. The old
  `resolveUserId` only fell back to `getCachedUserId()` inside `catch`, so
  offline the fallback never ran, `createIdea` returned `{ ok: false }`, and
  offline captures were silently lost. Fix: `return id ?? getCachedUserId()` so
  the cache is used whenever the live session resolves to no id. Lesson: for
  libraries that swallow fetch errors and resolve null, treat "resolved null" as
  the failure signal, not just thrown errors.

- **`ideas.id` integer/uuid drift (2026-08-09):** The live Neon DB was created
  via `db:push` from an older schema where `ideas.id` was `integer` serial, but
  the codebase, drizzle migrations, and PowerSync schema all use `uuid`. Any
  online capture failed with `invalid input syntax for type integer` because the
  client-generated UUID was inserted into an integer PK. Fixed by ALTERing the
  live `ideas` table to `uuid` (`gen_random_uuid()` default, sequence dropped)
  and verifying `upsertIdea` works. Lesson: when the PowerSync offline-first
  layer generates client UUIDs, the server PK type must be `uuid`/`text`; check
  the *live* DB schema (via `information_schema`) rather than trusting migrations,
  since this DB predates the migration history.

- **SQL placeholder/param mismatch in offline INSERT (2026-08-09):**
  `lib/create-idea.ts` had 6 `?` placeholders but 5 params, so `deleted_at`
  received the timestamp meant for `updated_at` and `updated_at` was unbound.
  CodeRabbit caught it, not the tests, because `tests/helpers/powersync-fake.ts`
  binds params positionally and silently stores `undefined` for missing ones.
  Fixed by making `deleted_at` a literal `NULL` and added a test asserting the
  placeholder count equals the param count. Lesson: the fake db is permissive;
  unit tests that only assert on a couple of params will not surface
  count/ordering bugs — add explicit count + tail-param assertions.

