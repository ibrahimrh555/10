export const MATCH_CITIES = ["Errachidia", "Rabat", "Marrakech", "Tanger", "Fès"] as const;

function normalizeCity(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleLowerCase("fr");
}

export function filterCities(cities: readonly string[], query: string) {
  const normalizedQuery = normalizeCity(query);
  if (!normalizedQuery) return [...cities];
  return cities.filter((city) => normalizeCity(city).includes(normalizedQuery));
}
