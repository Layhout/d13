import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CARD_ASPECT_RATIO, DECK, DEFAULT_CARD_SIZE_PERCENT } from "./constants";
import type { PlayingCard } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getPlayingCardSize() {
  const width = (DEFAULT_CARD_SIZE_PERCENT / 100) * window.innerWidth;
  const height = width / CARD_ASPECT_RATIO;

  return {
    width: Math.round(width),
    height: Math.round(height),
  };
}

export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function dealCards(): { hand1: PlayingCard[]; hand2: PlayingCard[]; hand3: PlayingCard[]; hand4: PlayingCard[] } {
  const deck = DECK.slice();
  const shuffledDeck = shuffle(deck);
  const hand1: PlayingCard[] = [];
  const hand2: PlayingCard[] = [];
  const hand3: PlayingCard[] = [];
  const hand4: PlayingCard[] = [];

  for (let i = 0; i < shuffledDeck.length; i++) {
    if (i % 4 === 0) {
      hand1.push(shuffledDeck[i]);
    } else if (i % 4 === 1) {
      hand2.push(shuffledDeck[i]);
    } else if (i % 4 === 2) {
      hand3.push(shuffledDeck[i]);
    } else {
      hand4.push(shuffledDeck[i]);
    }
  }

  return { hand1, hand2, hand3, hand4 };
}

export function sortHand(hand: PlayingCard[]): PlayingCard[] {
  return hand.sort((a, b) => DECK.indexOf(a) - DECK.indexOf(b));
}
