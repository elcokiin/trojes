import * as Alchemy from "alchemy";
import * as Drizzle from "alchemy/Drizzle";
import * as Neon from "alchemy/Neon";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

export default Alchemy.Stack(
  "Trojes",
  {
    providers: Layer.mergeAll(Drizzle.providers(), Neon.providers()),
    state: Alchemy.localState(),
  },
  Effect.gen(function* () {
    const schema = yield* Drizzle.Schema("trojes-schema", {
      schema: "./db/schema.ts",
      out: "./drizzle",
    });

    const project = yield* Neon.Project("trojes-db", {
      region: "aws-us-east-1",
    });

    const branch = yield* Neon.Branch("trojes-branch", {
      project,
      migrations: schema,
    });

    return {
      projectId: project.projectId,
      branchId: branch.branchId,
      connectionUri: project.connectionUri,
      migrationsDir: schema.out,
    };
  }),
);
