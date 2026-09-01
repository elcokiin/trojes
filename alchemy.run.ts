import * as Alchemy from "alchemy";
import * as Provider from "alchemy/Provider";
import { Resource } from "alchemy/Resource";
import { Stack } from "alchemy/Stack";
import * as Effect from "effect/Effect";

export interface TursoDatabaseProps {
  name: string;
  group?: string;
  parentDatabase?: string;
}

export interface TursoDatabaseAttributes {
  name: string;
  group: string;
  url: string;
  authToken: string;
}

export type TursoDatabase = Resource<
  "Turso.Database",
  TursoDatabaseProps,
  TursoDatabaseAttributes
>;

export const TursoDatabase = Resource<TursoDatabase>("Turso.Database");

function getAuthHeaders() {
  const org = process.env.TURSO_ORG;
  const token = process.env.TURSO_API_TOKEN;
  if (!org || !token) {
    throw new Error("TURSO_ORG and TURSO_API_TOKEN must be set");
  }
  return { org, headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } };
}

export const TursoDatabaseProvider = () =>
  Provider.succeed(
    TursoDatabase,
    TursoDatabase.Provider.of({
      stables: ["name", "group"],

      list: () => Effect.succeed([]),

      reconcile: Effect.fn(function* ({ news, output }) {
        const { org, headers } = getAuthHeaders();
        const stack = yield* Stack;
        const dbName = stack.stage === "dev_cokiin" ? news.name : `${news.name}-${stack.stage}`;
        const group = news.group ?? "default";

        // Observe — check if database exists via cached output or API
        let live: TursoDatabaseAttributes | undefined = output ?? undefined;
        if (live?.name) {
          const res = yield* Effect.tryPromise(() =>
            fetch(`https://api.turso.tech/v1/organizations/${org}/databases/${live!.name}`, { headers })
          );
          if (!res.ok) live = undefined;
        }

        // Ensure — create if missing
        if (!live) {
          const body: Record<string, unknown> = { name: dbName, group };

          // If parentDatabase is specified, seed from it (creates a branch)
          if (news.parentDatabase) {
            body.seed = { type: "database", name: news.parentDatabase };
          }

          const res = yield* Effect.tryPromise(() =>
            fetch(`https://api.turso.tech/v1/organizations/${org}/databases`, {
              method: "POST",
              headers,
              body: JSON.stringify(body),
            })
          );

          // 409 = already exists, fetch it instead
          if (res.status === 409) {
            const getRes = yield* Effect.tryPromise(() =>
              fetch(`https://api.turso.tech/v1/organizations/${org}/databases/${dbName}`, { headers })
            );
            if (getRes.ok) {
              const json = (yield* Effect.tryPromise(() => getRes.json())) as {
                database: { Name: string; Hostname: string };
              };
              live = { name: json.database.Name, group, url: `libsql://${json.database.Hostname}`, authToken: "" };
            }
          } else if (!res.ok) {
            const errBody = yield* Effect.tryPromise(() => res.text());
            return yield* Effect.fail(new Error(`Turso create failed: ${res.status} ${errBody}`));
          } else {
            const json = (yield* Effect.tryPromise(() => res.json())) as {
              Name: string; Hostname: string;
            };
            live = { name: json.Name, group, url: `libsql://${json.Hostname}`, authToken: "" };
          }
        }

        // Create or refresh auth token
        const tokenRes = yield* Effect.tryPromise(() =>
          fetch(
            `https://api.turso.tech/v1/organizations/${org}/databases/${live!.name}/auth/tokens?expiration=never&authorization=full-access`,
            { method: "POST", headers }
          )
        );

        if (!tokenRes.ok) {
          const body = yield* Effect.tryPromise(() => tokenRes.text());
          return yield* Effect.fail(new Error(`Turso token creation failed: ${tokenRes.status} ${body}`));
        }

        const tokenJson = (yield* Effect.tryPromise(() => tokenRes.json())) as { jwt: string };

        return {
          name: live!.name,
          group: live!.group,
          url: live!.url,
          authToken: tokenJson.jwt,
        };
      }),

      delete: Effect.fn(function* ({ output }) {
        const { org, headers } = getAuthHeaders();
        yield* Effect.tryPromise(() =>
          fetch(`https://api.turso.tech/v1/organizations/${org}/databases/${output.name}`, {
            method: "DELETE",
            headers,
          })
        ).pipe(
          Effect.catch(() => Effect.succeed(undefined))
        );
      }),
    })
  );

export default Alchemy.Stack(
  "Trojes",
  {
    providers: TursoDatabaseProvider(),
    state: Alchemy.localState(),
  },
  Effect.gen(function* () {
    const stack = yield* Stack;

    // dev_cokiin: create primary database (no seed)
    if (stack.stage === "dev_cokiin") {
      const primary = yield* TursoDatabase("trojes-primary", {
        name: "trojes",
        group: "default",
      });

      return {
        databaseUrl: primary.url,
        databaseName: primary.name,
        TURSO_AUTH_TOKEN: primary.authToken,
      };
    }

    // Other stages: create a branch seeded from the primary "trojes" database
    const branch = yield* TursoDatabase("trojes-branch", {
      name: "trojes",
      group: "default",
      parentDatabase: "trojes",
    });

    return {
      databaseUrl: branch.url,
      databaseName: branch.name,
      TURSO_AUTH_TOKEN: branch.authToken,
    };
  })
);
