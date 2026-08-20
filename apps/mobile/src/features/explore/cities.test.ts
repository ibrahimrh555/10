import { describe, expect, it } from "vitest";
import { filterCities, MATCH_CITIES } from "./cities";

describe("filtre de ville", () => {
  it("affiche toutes les villes lorsque la recherche est vide", () => {
    expect(filterCities(MATCH_CITIES, "")).toEqual(MATCH_CITIES);
  });

  it("filtre avec une recherche partielle", () => {
    expect(filterCities(MATCH_CITIES, "mar")).toEqual(["Marrakech"]);
  });

  it("ignore les majuscules et les espaces", () => {
    expect(filterCities(MATCH_CITIES, "  RAB  ")).toEqual(["Rabat"]);
  });

  it("ignore les accents", () => {
    expect(filterCities(MATCH_CITIES, "fes")).toEqual(["Fès"]);
  });

  it("retourne une liste vide sans correspondance", () => {
    expect(filterCities(MATCH_CITIES, "Agadir")).toEqual([]);
  });
});
