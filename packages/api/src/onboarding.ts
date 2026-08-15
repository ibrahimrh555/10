import { asc, eq } from "drizzle-orm";
import { cities, notificationDevices, notificationPreferences, user } from "@10in/db";
import { createRouter, protectedProcedure, publicProcedure } from "@10in/api-core";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const publicCity = { id: cities.id, name: cities.name, countryCode: cities.countryCode };
const countryCodeSchema = z.string().trim().length(2).transform(value => value.toUpperCase()).optional();
const normalizeSearch = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr");
const normalizeName = (value: string) => value.trim().replace(/\s+/gu, " ");
const nameSchema = z.string().transform(normalizeName).pipe(z.string().min(2).max(60));
const subscriptionIdSchema = z.string().trim().min(8).max(256).regex(/^[\p{L}\p{N}._:-]+$/u, "Identifiant d'abonnement invalide");
const preferencesSelection = { pushEnabled: notificationPreferences.pushEnabled, gameInvitationsEnabled: notificationPreferences.gameInvitationsEnabled, gameRemindersEnabled: notificationPreferences.gameRemindersEnabled, chatMessagesEnabled: notificationPreferences.chatMessagesEnabled, circleUpdatesEnabled: notificationPreferences.circleUpdatesEnabled, marketingEnabled: notificationPreferences.marketingEnabled };
type OnboardingStep = "NAME" | "PHOTO" | "NOTIFICATIONS" | "COMPLETED";

function isValidOnboardingName(name: string, email: string): boolean {
  const normalized = normalizeName(name);
  if (normalized.length < 2 || normalized.length > 60) return false;
  const temporaryNames = new Set(["user", "utilisateur", "unknown", "nouvel utilisateur", email, email.split("@")[0] ?? ""]);
  return !temporaryNames.has(normalized.toLocaleLowerCase("fr"));
}

function requiredStep(current: { name: string; email: string; cityId: string | null; profilePhotoStepCompleted: boolean; notificationPermissionAsked: boolean }): OnboardingStep {
  if (!isValidOnboardingName(current.name, current.email)) return "NAME";
  if (!current.cityId) throw new TRPCError({ code: "CONFLICT", message: "ONBOARDING_CITY_REQUIRED" });
  if (!current.profilePhotoStepCompleted) return "PHOTO";
  if (!current.notificationPermissionAsked) return "NOTIFICATIONS";
  return "COMPLETED";
}

export const citiesRouter = createRouter({
  list: publicProcedure.input(z.object({ countryCode: countryCodeSchema }).optional()).query(async ({ ctx, input }) => ({ cities: input?.countryCode ? await ctx.db.select(publicCity).from(cities).where(eq(cities.countryCode, input.countryCode)).orderBy(asc(cities.name)).limit(100) : await ctx.db.select(publicCity).from(cities).orderBy(asc(cities.name)).limit(100) })),
  search: publicProcedure.input(z.object({ search: z.string().trim().min(1).max(80), countryCode: countryCodeSchema })).query(async ({ ctx, input }) => {
    const candidates = input.countryCode ? await ctx.db.select(publicCity).from(cities).where(eq(cities.countryCode, input.countryCode)).orderBy(asc(cities.name)).limit(500) : await ctx.db.select(publicCity).from(cities).orderBy(asc(cities.name)).limit(500);
    const needle = normalizeSearch(input.search);
    return { cities: candidates.filter(city => normalizeSearch(city.name).includes(needle)).slice(0, 20) };
  }),
});

export const onboardingUserRouter = createRouter({
  setCity: protectedProcedure.input(z.object({ cityId: z.string().trim().min(1).max(128) })).mutation(async ({ ctx, input }) => {
    const selected = (await ctx.db.select(publicCity).from(cities).where(eq(cities.id, input.cityId)).limit(1))[0];
    if (!selected) throw new TRPCError({ code: "NOT_FOUND", message: "Ville inconnue" });
    await ctx.db.update(user).set({ cityId: selected.id, updatedAt: new Date() }).where(eq(user.id, ctx.session.user.id));
    return { city: selected };
  }),
  updateName: protectedProcedure.input(z.object({ name: nameSchema })).mutation(async ({ ctx, input }) => {
    const updated = (await ctx.db.update(user).set({ name: input.name, updatedAt: new Date() }).where(eq(user.id, ctx.session.user.id)).returning({ id: user.id, name: user.name, image: user.image, cityId: user.cityId, onboardingCompleted: user.onboardingCompleted }))[0];
    if (!updated) throw new TRPCError({ code: "NOT_FOUND", message: "Utilisateur inconnu" });
    return updated;
  }),
  skipProfilePhoto: protectedProcedure.mutation(async ({ ctx }) => {
    const updated = (await ctx.db.update(user).set({ profilePhotoStepCompleted: true, updatedAt: new Date() }).where(eq(user.id, ctx.session.user.id)).returning({ image: user.image, profilePhotoStepCompleted: user.profilePhotoStepCompleted }))[0];
    if (!updated) throw new TRPCError({ code: "NOT_FOUND", message: "Utilisateur inconnu" });
    return updated;
  }),
  getOnboardingStatus: protectedProcedure.query(async ({ ctx }) => {
    const current = (await ctx.db.select({ name: user.name, email: user.email, cityId: user.cityId, onboardingCompleted: user.onboardingCompleted, profilePhotoStepCompleted: user.profilePhotoStepCompleted, notificationPermissionAsked: user.notificationPermissionAsked }).from(user).where(eq(user.id, ctx.session.user.id)).limit(1))[0];
    if (!current) throw new TRPCError({ code: "NOT_FOUND", message: "Utilisateur inconnu" });
    return { onboardingCompleted: current.onboardingCompleted, nextStep: current.onboardingCompleted ? "COMPLETED" as const : requiredStep(current) };
  }),
  completeOnboarding: protectedProcedure.mutation(async ({ ctx }) => ctx.db.transaction(async tx => {
    const current = (await tx.select({ name: user.name, email: user.email, cityId: user.cityId, onboardingCompleted: user.onboardingCompleted, profilePhotoStepCompleted: user.profilePhotoStepCompleted, notificationPermissionAsked: user.notificationPermissionAsked }).from(user).where(eq(user.id, ctx.session.user.id)).limit(1))[0];
    if (!current) throw new TRPCError({ code: "NOT_FOUND", message: "Utilisateur inconnu" });
    if (!current.onboardingCompleted) {
      const nextStep = requiredStep(current);
      if (nextStep !== "COMPLETED") throw new TRPCError({ code: "CONFLICT", message: `ONBOARDING_STEP_REQUIRED:${nextStep}` });
      await tx.update(user).set({ onboardingCompleted: true, updatedAt: new Date() }).where(eq(user.id, ctx.session.user.id));
    }
    return { onboardingCompleted: true as const, nextStep: "COMPLETED" as const };
  })),
});

export const notificationsOnboardingRouter = createRouter({
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    await ctx.db.insert(notificationPreferences).values({ id: crypto.randomUUID(), userId }).onConflictDoNothing({ target: notificationPreferences.userId });
    const preferences = (await ctx.db.select(preferencesSelection).from(notificationPreferences).where(eq(notificationPreferences.userId, userId)).limit(1))[0];
    if (!preferences) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Impossible de charger les préférences" });
    return preferences;
  }),
  updatePreferences: protectedProcedure.input(z.object({ pushEnabled: z.boolean(), gameInvitationsEnabled: z.boolean().optional(), gameRemindersEnabled: z.boolean().optional(), chatMessagesEnabled: z.boolean().optional(), circleUpdatesEnabled: z.boolean().optional(), marketingEnabled: z.boolean().optional() })).mutation(async ({ ctx, input }) => ctx.db.transaction(async tx => {
    const userId = ctx.session.user.id;
    const now = new Date();
    const values = Object.fromEntries(Object.entries(input).filter((entry): entry is [string, boolean] => entry[1] !== undefined));
    await tx.insert(notificationPreferences).values({ id: crypto.randomUUID(), userId, ...values, updatedAt: now }).onConflictDoUpdate({ target: notificationPreferences.userId, set: { ...values, updatedAt: now } });
    const updatedUser = await tx.update(user).set({ notificationPermissionAsked: true, updatedAt: now }).where(eq(user.id, userId)).returning({ id: user.id });
    if (updatedUser.length === 0) throw new TRPCError({ code: "NOT_FOUND", message: "Utilisateur inconnu" });
    const preferences = (await tx.select(preferencesSelection).from(notificationPreferences).where(eq(notificationPreferences.userId, userId)).limit(1))[0];
    if (!preferences) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Impossible de charger les préférences" });
    return preferences;
  })),
  registerDevice: protectedProcedure.input(z.object({ subscriptionId: subscriptionIdSchema, platform: z.enum(["ios", "android"]) })).mutation(async ({ ctx, input }) => ctx.db.transaction(async tx => {
    const userId = ctx.session.user.id;
    const existing = (await tx.select({ id: notificationDevices.id, userId: notificationDevices.userId }).from(notificationDevices).where(eq(notificationDevices.subscriptionId, input.subscriptionId)).limit(1))[0];
    if (existing && existing.userId !== userId) throw new TRPCError({ code: "CONFLICT", message: "DEVICE_ALREADY_LINKED" });
    const now = new Date();
    const device = existing
      ? (await tx.update(notificationDevices).set({ provider: "onesignal", platform: input.platform, active: true, lastSeenAt: now, updatedAt: now }).where(eq(notificationDevices.id, existing.id)).returning())[0]
      : (await tx.insert(notificationDevices).values({ id: crypto.randomUUID(), userId, provider: "onesignal", subscriptionId: input.subscriptionId, platform: input.platform, active: true, lastSeenAt: now }).returning())[0];
    if (!device) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Impossible d'enregistrer l'appareil" });
    return device;
  })),
  unregisterDevice: protectedProcedure.input(z.object({ subscriptionId: subscriptionIdSchema })).mutation(async ({ ctx, input }) => {
    const existing = (await ctx.db.select({ id: notificationDevices.id, userId: notificationDevices.userId }).from(notificationDevices).where(eq(notificationDevices.subscriptionId, input.subscriptionId)).limit(1))[0];
    if (!existing || existing.userId !== ctx.session.user.id) throw new TRPCError({ code: "NOT_FOUND", message: "Appareil inconnu" });
    const device = (await ctx.db.update(notificationDevices).set({ active: false, updatedAt: new Date() }).where(eq(notificationDevices.id, existing.id)).returning({ subscriptionId: notificationDevices.subscriptionId, active: notificationDevices.active }))[0];
    if (!device) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Impossible de désactiver l'appareil" });
    return device;
  }),
});
