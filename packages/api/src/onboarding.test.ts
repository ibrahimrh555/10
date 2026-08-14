import { randomUUID } from "node:crypto";
import { unlink } from "node:fs/promises";
import { resolve } from "node:path";
import { createDatabase, user } from "@10in/db";
import { migrate } from "drizzle-orm/libsql/migrator";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { appRouter } from "./index";

const file = resolve(`api-${randomUUID()}.db`);
const database = createDatabase({ url: `file:${file}` });
const request = new Request("http://localhost/trpc");
const session = { session: { id: "s", userId: "onboarding_user", token: "t", expiresAt: new Date(Date.now() + 60_000) }, user: { id: "onboarding_user", email: "onboarding@example.test", name: "" } };

beforeAll(async () => {
  await migrate(database.db, { migrationsFolder: resolve("../db/drizzle") });
  await database.db.insert(user).values({ id: "onboarding_user", email: "onboarding@example.test", name: "" });
}, 30_000);
afterAll(async () => { database.client.close(); await unlink(file).catch(() => undefined); });

describe("cities and onboarding procedures", () => {
  it("lists and accent-normalizes city search", async () => {
    const caller = appRouter.createCaller({ request, db: database.db, session });
    expect((await caller.cities.list({})).cities.length).toBe(0);
    await database.client.execute({ sql: "insert into cities (id,name,country_code,latitude,longitude,created_at,updated_at) values (?,?,?,?,?,?,?)", args: ["city_fes", "Fès", "MA", 34, -5, Date.now(), Date.now()] });
    expect((await caller.cities.search({ search: "fes" })).cities[0]?.name).toBe("Fès");
  });
  it("rejects setCity without a session", async () => { const caller = appRouter.createCaller({ request, db: database.db, session: null }); await expect(caller.user.setCity({ cityId: "city_fes" })).rejects.toMatchObject({ code: "UNAUTHORIZED" }); });
  it("rejects an unknown city", async () => { const caller = appRouter.createCaller({ request, db: database.db, session }); await expect(caller.user.setCity({ cityId: "missing" })).rejects.toMatchObject({ code: "NOT_FOUND" }); });
  it("sets only the authenticated user's city and returns NAME", async () => { const caller = appRouter.createCaller({ request, db: database.db, session }); expect((await caller.user.setCity({ cityId: "city_fes" })).city.id).toBe("city_fes"); expect(await caller.user.getOnboardingStatus()).toEqual({ onboardingCompleted: false, nextStep: "NAME" }); });
});
