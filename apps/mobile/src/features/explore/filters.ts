import type { MatchFormat, MatchPreview } from "../../mocks/games";

export type MatchPeriod = "today" | "tomorrow" | "week" | "all";
export type ExploreFilters = { city: string; period: MatchPeriod; formats: MatchFormat[]; freeOnly: boolean; availableOnly: boolean };
export const DEFAULT_EXPLORE_FILTERS: ExploreFilters = { city: "", period: "all", formats: [], freeOnly: false, availableOnly: false };

export function filterGames(games: MatchPreview[], query: string, filters: ExploreFilters, now = new Date("2026-08-17T12:00:00+01:00")) {
  const normalized = query.trim().toLocaleLowerCase("fr");
  const start = new Date(now); start.setHours(0, 0, 0, 0);
  const tomorrow = new Date(start); tomorrow.setDate(tomorrow.getDate() + 1);
  const weekEnd = new Date(start); weekEnd.setDate(weekEnd.getDate() + 7);
  return games.filter((game) => {
    const date = new Date(game.date);
    const textMatches = !normalized || `${game.clubName} ${game.cityName}`.toLocaleLowerCase("fr").includes(normalized);
    const periodMatches = filters.period === "all" || (filters.period === "today" ? date >= start && date < tomorrow : filters.period === "tomorrow" ? date >= tomorrow && date < new Date(tomorrow.getTime() + 86400000) : date >= start && date < weekEnd);
    return textMatches && (!filters.city || game.cityName === filters.city) && periodMatches && (!filters.formats.length || filters.formats.includes(game.format)) && (!filters.freeOnly || game.price === 0) && (!filters.availableOnly || game.participantsCount < game.capacity && game.status !== "cancelled");
  });
}

export const activeFilterCount = (filters: ExploreFilters) => filters.formats.length + Number(filters.freeOnly) + Number(filters.availableOnly) + Number(filters.period !== "all");
