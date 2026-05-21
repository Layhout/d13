import { DECK } from "./constants";

export type PlayingCard = (typeof DECK)[number];
export enum PlayerPosition {
  NORTH = "n",
  EAST = "e",
  SOUTH = "s",
  WEST = "w",
}
export enum CombinationType {
  SOLO = "solo",
  DOUBLE = "double",
  TRIPLE = "triple",
  QUAD = "quad",
  RUN = "run",
  DOUBLE_RUN = "double_run",
}
export interface Player {
  id: string;
  name: string;
  hand: PlayingCard[];
  isReady: boolean;
  isOffline: boolean;
  isTurn: boolean;
  isPassed: boolean;
}
