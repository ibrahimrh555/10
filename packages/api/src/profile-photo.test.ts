import { randomUUID } from "node:crypto";
import { unlink } from "node:fs/promises";
import { resolve } from "node:path";
import { createDatabase, user } from "@10in/db";
import { eq } from "drizzle-orm";
import { migrate } from "drizzle-orm/libsql/migrator";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import app, { type ApiBindings } from "./index";
import { extractSingleImage, MAX_PROFILE_PHOTO_BYTES, type ProfilePhotoStorage, uploadProfilePhoto } from "./profile-photo";

const file = resolve(`profile-photo-${randomUUID()}.db`);
const database = createDatabase({ url: `file:${file}` });
const put = vi.fn<ProfilePhotoStorage["put"]>();
const remove = vi.fn<ProfilePhotoStorage["delete"]>();
const storage: ProfilePhotoStorage = { put, delete: remove };
const bytes = {
  "image/jpeg": new Uint8Array([0xff, 0xd8, 0xff, 0xe0]),
  "image/png": new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  "image/webp": new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]),
};
const image = (type: keyof typeof bytes) => new File([bytes[type]], "untrusted-name", { type });

beforeAll(async () => { await migrate(database.db, { migrationsFolder: resolve("../db/drizzle") }); }, 30_000);
beforeEach(async () => {
  vi.clearAllMocks();
  put.mockResolvedValue({});
  remove.mockResolvedValue(undefined);
  await database.db.delete(user);
  await database.db.insert(user).values({ id: "photo_user", email: "photo@example.test", name: "Photo User", image: "https://cdn.test/profile-photos/photo_user/old.jpg" });
});
afterAll(async () => { database.client.close(); await unlink(file).catch(() => undefined); });

describe("profile photo upload", () => {
  it("rejects the HTTP route without a BetterAuth session", async () => {
    const form = new FormData();
    form.append("file", image("image/jpeg"));
    const env: ApiBindings = { NODE_ENV: "test", BETTER_AUTH_SECRET: "x".repeat(32), BETTER_AUTH_URL: "http://localhost", OTP_PROVIDER: "development", DATABASE_URL: `file:${file}`, MOBILE_APP_ORIGIN: "http://localhost", PROFILE_PHOTOS: storage, R2_PUBLIC_URL: "https://cdn.test" };
    const response = await app.request("http://localhost/api/assets/profile-photo", { method: "POST", body: form }, env);
    expect(response.status).toBe(401);
  });
  it.each(["image/jpeg", "image/png", "image/webp"] as const)("stores a valid %s and completes the step", async type => {
    const result = await uploadProfilePhoto({ db: database.db, storage, publicUrl: "https://cdn.test", userId: "photo_user", file: image(type) });
    expect(result.profilePhotoStepCompleted).toBe(true);
    expect(result.imageUrl).toMatch(/^https:\/\/cdn\.test\/profile-photos\/photo_user\/[\w-]+\.(jpg|png|webp)$/u);
    expect(put).toHaveBeenCalledOnce();
    expect(remove).toHaveBeenCalledWith("profile-photos/photo_user/old.jpg");
    expect((await database.db.select({ completed: user.profilePhotoStepCompleted }).from(user).where(eq(user.id, "photo_user")))[0]?.completed).toBe(true);
  });
  it.each([
    [new File([], "empty.jpg", { type: "image/jpeg" }), "non vide"],
    [new File(["<svg/>"] , "attack.svg", { type: "image/svg+xml" }), "non autorisé"],
    [new File(["not a jpeg"], "fake.jpg", { type: "image/jpeg" }), "type MIME"],
    [new File([new Uint8Array(MAX_PROFILE_PHOTO_BYTES + 1)], "huge.jpg", { type: "image/jpeg" }), "5 Mo"],
  ])("rejects invalid files", async (fileValue, message) => {
    await expect(uploadProfilePhoto({ db: database.db, storage, publicUrl: "https://cdn.test", userId: "photo_user", file: fileValue })).rejects.toThrow(message);
    expect(put).not.toHaveBeenCalled();
  });
  it("preserves the old photo when R2 fails", async () => {
    put.mockRejectedValueOnce(new Error("R2 unavailable"));
    await expect(uploadProfilePhoto({ db: database.db, storage, publicUrl: "https://cdn.test", userId: "photo_user", file: image("image/jpeg") })).rejects.toThrow("stockage");
    expect((await database.db.select({ image: user.image }).from(user).where(eq(user.id, "photo_user")))[0]?.image).toContain("old.jpg");
    expect(remove).not.toHaveBeenCalled();
  });
  it("requires exactly one file", () => {
    expect(() => extractSingleImage(new FormData())).toThrow("Exactement un fichier");
    const form = new FormData();
    form.append("first", image("image/png"));
    form.append("second", image("image/jpeg"));
    expect(() => extractSingleImage(form)).toThrow("Exactement un fichier");
  });
});
