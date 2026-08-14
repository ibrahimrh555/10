import { asc, eq } from "drizzle-orm";
import { cities, user } from "@10in/db";
import { createRouter, protectedProcedure, publicProcedure } from "@10in/api-core";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const publicCity = { id: cities.id, name: cities.name, countryCode: cities.countryCode };
const countryCodeSchema = z.string().trim().length(2).transform(value => value.toUpperCase()).optional();
const normalizeSearch = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr");

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
  getOnboardingStatus: protectedProcedure.query(async ({ ctx }) => {
    const current = (await ctx.db.select({ name: user.name, onboardingCompleted: user.onboardingCompleted, profilePhotoStepCompleted: user.profilePhotoStepCompleted, notificationPermissionAsked: user.notificationPermissionAsked }).from(user).where(eq(user.id, ctx.session.user.id)).limit(1))[0];
    if (!current) throw new TRPCError({ code: "NOT_FOUND", message: "Utilisateur inconnu" });
    const nextStep = current.onboardingCompleted ? "COMPLETED" : !current.name.trim() ? "NAME" : !current.profilePhotoStepCompleted ? "PHOTO" : !current.notificationPermissionAsked ? "NOTIFICATIONS" : "COMPLETED";
    return { onboardingCompleted: current.onboardingCompleted, nextStep } as const;
  }),
});
