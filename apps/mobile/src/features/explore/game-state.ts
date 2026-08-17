import type { MatchPreview } from "../../mocks/games";

export type GamePrimaryAction = "manage" | "joined" | "full" | "join";
export function getGamePrimaryAction(game: MatchPreview): GamePrimaryAction {
  if (game.isHost) return "manage";
  if (game.isJoined) return "joined";
  if (game.status === "full") return "full";
  return "join";
}
