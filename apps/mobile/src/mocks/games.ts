export type MatchFormat = "5v5" | "7v7" | "9v9" | "11v11";
export type MatchStatus = "available" | "almost-full" | "full" | "cancelled";

export type MatchPreview = {
  id: string;
  clubName: string;
  cityName: string;
  venueAddress: string;
  date: string;
  format: MatchFormat;
  price: number;
  currency: "MAD";
  participantsCount: number;
  capacity: number;
  status: MatchStatus;
  participantAvatars: string[];
  isJoined: boolean;
  isHost: boolean;
  hostName: string;
  information: string[];
};

const avatars = [
  "https://i.pravatar.cc/100?img=12",
  "https://i.pravatar.cc/100?img=13",
  "https://i.pravatar.cc/100?img=15",
  "https://i.pravatar.cc/100?img=33",
  "https://i.pravatar.cc/100?img=35",
  "https://i.pravatar.cc/100?img=47",
];

export const mockGames: MatchPreview[] = [
  { id: "club-atlas", clubName: "Club Atlas", cityName: "Errachidia", venueAddress: "Terrain Atlas, quartier Al Massira, Errachidia", date: "2026-08-17T19:00:00+01:00", format: "5v5", price: 20, currency: "MAD", participantsCount: 8, capacity: 10, status: "available", participantAvatars: avatars.slice(0, 5), isJoined: false, isHost: false, hostName: "Yassine El Amrani", information: ["Respect et fair-play obligatoires", "Pas de semelles sur le terrain", "Arriver 15 min avant le début"] },
  { id: "terrain-al-amal", clubName: "Terrain Al Amal", cityName: "Errachidia", venueAddress: "Avenue Moulay Ali Cherif, Errachidia", date: "2026-08-18T18:30:00+01:00", format: "7v7", price: 0, currency: "MAD", participantsCount: 10, capacity: 14, status: "available", participantAvatars: avatars, isJoined: true, isHost: false, hostName: "Sofiane Haddad", information: ["Chaussures adaptées au synthétique", "Vestiaires disponibles"] },
  { id: "arena-errachidia", clubName: "Arena Errachidia", cityName: "Errachidia", venueAddress: "Route de Meknès, Errachidia", date: "2026-08-23T20:00:00+01:00", format: "5v5", price: 30, currency: "MAD", participantsCount: 10, capacity: 10, status: "full", participantAvatars: avatars, isJoined: false, isHost: false, hostName: "Mehdi Karim", information: ["Match amical", "Ballon fourni"] },
  { id: "complexe-ouarzazate", clubName: "Complexe Atlas", cityName: "Ouarzazate", venueAddress: "Centre-ville, Ouarzazate", date: "2026-08-19T21:00:00+01:00", format: "9v9", price: 25, currency: "MAD", participantsCount: 17, capacity: 18, status: "almost-full", participantAvatars: avatars, isJoined: false, isHost: true, hostName: "Ibrahim Rahmani", information: ["Niveau intermédiaire", "Présence 20 min avant le match"] },
];

export function findMockGame(gameId: string) {
  return mockGames.find((game) => game.id === gameId);
}
