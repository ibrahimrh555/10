import { eq } from "drizzle-orm";
import { user, type Database } from "@10in/db";
import { HTTPException } from "hono/http-exception";

export const MAX_PROFILE_PHOTO_BYTES = 5 * 1024 * 1024;
const extensions = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } as const;
type AllowedMime = keyof typeof extensions;

export interface ProfilePhotoStorage {
  put(key: string, value: ArrayBuffer, options: { httpMetadata: { contentType: string } }): Promise<unknown>;
  delete(key: string): Promise<void>;
}

export interface UploadProfilePhotoOptions {
  db: Database;
  storage: ProfilePhotoStorage;
  publicUrl: string;
  userId: string;
  file: File;
}

function detectedMime(bytes: Uint8Array): AllowedMime | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 8 && [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((value, index) => bytes[index] === value)) return "image/png";
  if (bytes.length >= 12 && new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP") return "image/webp";
  return null;
}

function ownedKey(imageUrl: string | null, publicUrl: string): string | null {
  if (!imageUrl) return null;
  const prefix = `${publicUrl.replace(/\/$/u, "")}/`;
  if (!imageUrl.startsWith(prefix)) return null;
  const key = imageUrl.slice(prefix.length);
  return key.startsWith("profile-photos/") && !key.includes("..") ? key : null;
}

export async function uploadProfilePhoto(options: UploadProfilePhotoOptions): Promise<{ imageUrl: string; profilePhotoStepCompleted: true }> {
  const { db, file, publicUrl, storage, userId } = options;
  if (!(file instanceof File) || file.size === 0) throw new HTTPException(400, { message: "Un fichier image non vide est requis" });
  if (file.size > MAX_PROFILE_PHOTO_BYTES) throw new HTTPException(400, { message: "La photo dépasse la limite de 5 Mo" });
  if (!(file.type in extensions)) throw new HTTPException(400, { message: "Format d'image non autorisé" });
  const contents = await file.arrayBuffer();
  const actualMime = detectedMime(new Uint8Array(contents));
  if (!actualMime || actualMime !== file.type) throw new HTTPException(400, { message: "Le contenu du fichier ne correspond pas à son type MIME" });

  const current = (await db.select({ image: user.image }).from(user).where(eq(user.id, userId)).limit(1))[0];
  if (!current) throw new HTTPException(404, { message: "Utilisateur inconnu" });
  const key = `profile-photos/${userId}/${crypto.randomUUID()}.${extensions[actualMime]}`;
  const imageUrl = `${publicUrl.replace(/\/$/u, "")}/${key}`;

  try {
    await storage.put(key, contents, { httpMetadata: { contentType: actualMime } });
  } catch {
    throw new HTTPException(500, { message: "Échec du stockage de la photo" });
  }

  try {
    const updated = await db.transaction(async tx => tx.update(user).set({ image: imageUrl, profilePhotoStepCompleted: true, updatedAt: new Date() }).where(eq(user.id, userId)).returning({ id: user.id }));
    if (updated.length === 0) throw new HTTPException(404, { message: "Utilisateur inconnu" });
  } catch (error) {
    await storage.delete(key).catch(() => undefined);
    if (error instanceof HTTPException) throw error;
    throw new HTTPException(500, { message: "Échec de la mise à jour du profil" });
  }

  const oldKey = ownedKey(current.image, publicUrl);
  if (oldKey && oldKey !== key) await storage.delete(oldKey).catch(() => undefined);
  return { imageUrl, profilePhotoStepCompleted: true };
}

export function extractSingleImage(form: FormData): File {
  const files = [...form.values()].filter((value): value is File => value instanceof File);
  if (files.length !== 1) throw new HTTPException(400, { message: "Exactement un fichier image est requis" });
  return files[0]!;
}
