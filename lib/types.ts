import { DECK, PLAYER_POSITIONS } from "./constants";

export type PlayingCard = (typeof DECK)[number];
export type PlayerPosition = (typeof PLAYER_POSITIONS)[number];
export enum CombinationType {
  SOLO = "solo",
  DOUBLE = "double",
  TRIPLE = "triple",
  QUAD = "quad",
  RUN = "run",
  DOUBLE_RUN = "double_run",
}
