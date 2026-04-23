import { createRouter, publicQuery } from "./middleware";
import { entryRouter } from "./routers/entry";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  entry: entryRouter,
});

export type AppRouter = typeof appRouter;
