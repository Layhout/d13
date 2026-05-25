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

export interface Profile {
  name: string;
  avatarName: string;
  id?: string;
}

export interface Player extends Profile {
  isReady?: boolean;
  isTurn?: boolean;
  isPass?: boolean;
  place?: "1" | "2" | "3" | "4";
}

export type GameStatus = "start" | "ongoing" | "idle";

export interface Game {
  players: Player[];
  played: PlayingCard[];
  hands: PlayingCard[][];
  status: GameStatus;
}
