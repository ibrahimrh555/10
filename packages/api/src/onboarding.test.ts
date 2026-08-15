import { randomUUID } from "node:crypto";
import { unlink } from "node:fs/promises";
import { resolve } from "node:path";
import { cities, createDatabase, notificationDevices, notificationPreferences, user } from "@10in/db";
import { eq } from "drizzle-orm";
import { migrate } from "drizzle-orm/libsql/migrator";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { appRouter } from "./index";

const file = resolve(`api-${randomUUID()}.db`);
const database = createDatabase({ url: `file:${file}` });
const request = new Request("http://localhost/trpc");
const sessionFor = (id: string) => ({ session: { id: `s_${id}`, userId: id, token: `t_${id}`, expiresAt: new Date(Date.now() + 60_000) }, user: { id, email: `${id}@example.test`, name: "" } });
const callerFor = (id: string | null) => appRouter.createCaller({ request, db: database.db, session: id ? sessionFor(id) : null });

beforeAll(async () => {
  await migrate(database.db, { migrationsFolder: resolve("../db/drizzle") });
  await database.db.insert(cities).values({ id: "city_fes", name: "Fès", countryCode: "MA", latitude: 34, longitude: -5 });
}, 30_000);
beforeEach(async () => {
  await database.db.delete(notificationDevices);
  await database.db.delete(notificationPreferences);
  await database.db.delete(user);
  await database.db.insert(user).values([
    { id: "primary", email: "primary@example.test", name: "", cityId: "city_fes" },
    { id: "other", email: "other@example.test", name: "Autre Joueur", cityId: "city_fes" },
  ]);
});
afterAll(async () => { database.client.close(); await unlink(file).catch(() => undefined); });

describe("user.updateName and profile-photo step", () => {
  it("normalizes spaces and accepts Unicode", async () => {
    expect((await callerFor("primary").user.updateName({ name: "  إبراهم   الرحمٰني  " })).name).toBe("إبراهم الرحمٰني");
  });
  it.each(["", "a", "x".repeat(61)])("rejects invalid name %j", async name => {
    await expect(callerFor("primary").user.updateName({ name })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
  it("requires a session and cannot target another user", async () => {
    await expect(callerFor(null).user.updateName({ name: "Nom Valide" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await callerFor("primary").user.updateName({ name: "Nom Principal" });
    expect((await database.db.select({ name: user.name }).from(user).where(eq(user.id, "other")))[0]?.name).toBe("Autre Joueur");
  });
  it("skip marks the step without deleting an existing image", async () => {
    await database.db.update(user).set({ image: "https://cdn.test/existing.jpg" }).where(eq(user.id, "primary"));
    expect(await callerFor("primary").user.skipProfilePhoto()).toEqual({ image: "https://cdn.test/existing.jpg", profilePhotoStepCompleted: true });
  });
});

describe("notification onboarding", () => {
  it("creates safe defaults with marketing and push disabled", async () => {
    expect(await callerFor("primary").notifications.getPreferences()).toEqual({ pushEnabled: false, gameInvitationsEnabled: true, gameRemindersEnabled: true, chatMessagesEnabled: true, circleUpdatesEnabled: true, marketingEnabled: false });
  });
  it("updates partially and marks permission asked", async () => {
    await callerFor("primary").notifications.getPreferences();
    const result = await callerFor("primary").notifications.updatePreferences({ pushEnabled: true, chatMessagesEnabled: false });
    expect(result).toMatchObject({ pushEnabled: true, chatMessagesEnabled: false, gameInvitationsEnabled: true, marketingEnabled: false });
    expect((await database.db.select({ asked: user.notificationPermissionAsked }).from(user).where(eq(user.id, "primary")))[0]?.asked).toBe(true);
  });
  it("registers, reactivates and unregisters the current device", async () => {
    const subscriptionId = "onesignal.subscription_123";
    expect((await callerFor("primary").notifications.registerDevice({ subscriptionId, platform: "ios" }))?.provider).toBe("onesignal");
    expect((await callerFor("primary").notifications.unregisterDevice({ subscriptionId })).active).toBe(false);
    expect((await callerFor("primary").notifications.registerDevice({ subscriptionId, platform: "android" }))?.active).toBe(true);
  });
  it("rejects invalid platforms, anonymous calls and cross-account takeover", async () => {
    await expect(callerFor(null).notifications.registerDevice({ subscriptionId: "subscription_123", platform: "ios" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(callerFor("primary").notifications.registerDevice({ subscriptionId: "subscription_123", platform: "windows" as "ios" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await callerFor("other").notifications.registerDevice({ subscriptionId: "subscription_123", platform: "ios" });
    await expect(callerFor("primary").notifications.registerDevice({ subscriptionId: "subscription_123", platform: "ios" })).rejects.toMatchObject({ code: "CONFLICT" });
    await expect(callerFor("primary").notifications.unregisterDevice({ subscriptionId: "subscription_123" })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});

describe("onboarding state machine", () => {
  it("returns NAME, PHOTO, NOTIFICATIONS then COMPLETED", async () => {
    const caller = callerFor("primary");
    expect((await caller.user.getOnboardingStatus()).nextStep).toBe("NAME");
    await caller.user.updateName({ name: "Joueur Test" });
    expect((await caller.user.getOnboardingStatus()).nextStep).toBe("PHOTO");
    await caller.user.skipProfilePhoto();
    expect((await caller.user.getOnboardingStatus()).nextStep).toBe("NOTIFICATIONS");
    await caller.notifications.updatePreferences({ pushEnabled: false });
    expect((await caller.user.getOnboardingStatus()).nextStep).toBe("COMPLETED");
  });
  it.each([
    ["NAME", {}],
    ["PHOTO", { name: "Joueur Test" }],
    ["NOTIFICATIONS", { name: "Joueur Test", profilePhotoStepCompleted: true }],
  ] as const)("rejects completion when %s is missing", async (step, values) => {
    if (Object.keys(values).length > 0) await database.db.update(user).set(values).where(eq(user.id, "primary"));
    await expect(callerFor("primary").user.completeOnboarding()).rejects.toMatchObject({ code: "CONFLICT", message: `ONBOARDING_STEP_REQUIRED:${step}` });
  });
  it("reports the abnormal missing-city state", async () => {
    await database.db.update(user).set({ name: "Joueur Test", cityId: null }).where(eq(user.id, "primary"));
    await expect(callerFor("primary").user.completeOnboarding()).rejects.toMatchObject({ code: "CONFLICT", message: "ONBOARDING_CITY_REQUIRED" });
  });
  it("completes idempotently", async () => {
    await database.db.update(user).set({ name: "Joueur Test", profilePhotoStepCompleted: true, notificationPermissionAsked: true }).where(eq(user.id, "primary"));
    expect(await callerFor("primary").user.completeOnboarding()).toEqual({ onboardingCompleted: true, nextStep: "COMPLETED" });
    expect(await callerFor("primary").user.completeOnboarding()).toEqual({ onboardingCompleted: true, nextStep: "COMPLETED" });
  });
});
