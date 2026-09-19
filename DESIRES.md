# Desires

Use this file to record missing context, tools, scripts, documentation, or
capabilities that would make future work easier, faster, or safer.

- `@effect/vitest` (or an equivalent `TestClock` harness). The sync retry path
  uses `Schedule.exponential(1000)`, so verifying "network flaky → bounded
  backoff → marked failed" in a test would take ~30s of real time. Today only
  the offline short-circuit, the success path, the 401 permanent failure, and
  the exhausted-budget branch are covered (`tests/lib/outbox-sync.test.ts`).

- `fake-indexeddb` as a devDependency. Vitest runs in jsdom, which has no
  IndexedDB, so `lib/outbox/db.ts` and the Dexie write path in
  `lib/outbox/ideas-cache.ts` cannot be exercised by tests. The store message
  queue and the controller are covered with mocked repositories
  (`tests/lib/ideas-cache-controller.test.ts`), but the message-to-Dexie mapping
  itself (bulkPut / delete / per-user clear, and the `tags` JSON round trip) is
  only verified by hand.
