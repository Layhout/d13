import { DECK, PLAYER_POSITIONS } from "./constants";

export type PlayingCard = (typeof DECK)[number];
export type PlayerPosition = (typeof PLAYER_POSITIONS)[number];
