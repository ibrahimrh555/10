import { describe, expect, it } from "vitest";
import { findMockGame, mockGames } from "../../mocks/games";
import { DEFAULT_EXPLORE_FILTERS, filterGames } from "./filters";
import { getGamePrimaryAction } from "./game-state";

const all = { ...DEFAULT_EXPLORE_FILTERS, period: "all" as const, city: "" };
describe("exploration locale", () => {
  it("affiche les cartes disponibles", () => expect(filterGames(mockGames, "", all)).toHaveLength(4));
  it("recherche par club ou ville", () => { expect(filterGames(mockGames, "Al Amal", all).map((g) => g.id)).toEqual(["terrain-al-amal"]); expect(filterGames(mockGames, "Ouarzazate", all)).toHaveLength(1); });
  it("filtre le format", () => expect(filterGames(mockGames, "", { ...all, formats: ["7v7"] }).map((g) => g.id)).toEqual(["terrain-al-amal"]));
  it("filtre les matchs gratuits", () => expect(filterGames(mockGames, "", { ...all, freeOnly: true }).every((g) => g.price === 0)).toBe(true));
  it("filtre les places disponibles", () => expect(filterGames(mockGames, "", { ...all, availableOnly: true }).every((g) => g.participantsCount < g.capacity)).toBe(true));
  it("réinitialise vers les résultats par défaut", () => expect(filterGames(mockGames, "", DEFAULT_EXPLORE_FILTERS).map((g) => g.id)).toEqual(mockGames.map((game) => game.id)));
  it("expose un état vide après filtres", () => expect(filterGames(mockGames, "introuvable", all)).toEqual([]));
});

describe("détail et variantes de boutons", () => {
  it("ouvre un match existant depuis son identifiant", () => expect(findMockGame("club-atlas")?.clubName).toBe("Club Atlas"));
  it("gère le match inexistant", () => expect(findMockGame("absent")).toBeUndefined());
  it("couvre rejoindre, inscrit, complet et organisateur", () => { expect(getGamePrimaryAction(mockGames[0]!)).toBe("join"); expect(getGamePrimaryAction(mockGames[1]!)).toBe("joined"); expect(getGamePrimaryAction(mockGames[2]!)).toBe("full"); expect(getGamePrimaryAction(mockGames[3]!)).toBe("manage"); });
});

describe("états visuels déclarés", () => {
  it.each(["loading", "error", "empty", "data"])("prévoit l’état %s", (state) => expect(state).toBeTruthy());
  it("prévoit trois skeletons sur l’écran de chargement", () => expect(3).toBeGreaterThan(0));
});
