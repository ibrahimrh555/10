import { randomUUID } from "node:crypto";
import { unlink } from "node:fs/promises";
import { resolve } from "node:path";
import { eq, sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/libsql/migrator";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createDatabase } from "./client";
import { seed } from "./seed";
import { connectionRequests, games, session, user } from "./schema";

const path = resolve(`test-${randomUUID()}.db`);
const url = `file:${path}`;
let database: ReturnType<typeof createDatabase>;

beforeAll(async () => {
  const migrator = createDatabase({ url });
  await migrate(migrator.db, { migrationsFolder: resolve("drizzle") });
  migrator.client.close();
  await seed(url);
  database = createDatabase({ url });
}, 30_000);
afterAll(async () => { database.client.close(); await unlink(path).catch(() => undefined); });

describe("database integration", () => {
  it("loads seeded relations", async () => {
    const result = await database.db.query.games.findFirst({ where: eq(games.id, "game_future"), with: { host: true, club: { with: { city: true } }, players: true } });
    expect(result?.host.email).toBe("joueur1@example.test");
    expect(result?.club.city.name).toBe("Rabat");
    expect(result?.players.length).toBe(4);
  });

  it("supports BetterAuth session reads and writes", async () => {
    await database.db.insert(session).values({ id: "session_test", userId: "user_01", token: "opaque-test-token", expiresAt: new Date(Date.now() + 60_000) });
    const stored = await database.db.query.session.findFirst({ where: eq(session.token, "opaque-test-token"), with: { user: true } });
    expect(stored?.user.id).toBe("user_01");
  });

  it("rejects self and reverse duplicate pending connections", async () => {
    await expect(database.db.insert(connectionRequests).values({ id: "self", senderId: "user_01", receiverId: "user_01" })).rejects.toThrow();
    await database.db.insert(connectionRequests).values({ id: "pair-a", senderId: "user_12", receiverId: "user_13" });
    await expect(database.db.insert(connectionRequests).values({ id: "pair-b", senderId: "user_13", receiverId: "user_12" })).rejects.toThrow();
  });

  it("keeps business history when user deletion is attempted", async () => {
    await database.client.execute("PRAGMA foreign_keys = ON");
    await expect(database.db.delete(user).where(eq(user.id, "user_01"))).rejects.toThrow();
    const count = await database.db.select({ count: sql<number>`count(*)` }).from(games);
    expect(count[0]?.count).toBe(3);
  });
});
