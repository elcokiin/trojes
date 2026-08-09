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
