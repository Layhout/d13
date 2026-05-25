import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { AVATAR_NAMES, CARD_ASPECT_RATIO, DECK, DEFAULT_CARD_SIZE_PERCENT, RANK_ORDER, SEAT_MAP } from "./constants";
import { CombinationType, PlayerPosition, type Player, type PlayingCard } from "./types";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function randomNumBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export async function getClientId(): Promise<string> {
  const fp = await FingerprintJS.load();
  const result = await fp.get();

  return result.visitorId;
}

export function getPlayingCardSize(percent: number = DEFAULT_CARD_SIZE_PERCENT) {
  const width = (percent / 100) * window.innerWidth;
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

export function getRandomAvatarName() {
  return AVATAR_NAMES[Math.floor(Math.random() * AVATAR_NAMES.length)];
}

function getComboType(cards: PlayingCard[]): CombinationType | null {
  if (cards.length === 0) return null;

  const getCardRank = (card: PlayingCard) => RANK_ORDER.indexOf(card[0] as (typeof RANK_ORDER)[number]);

  if (cards.length === 1) return CombinationType.SOLO;

  if (cards.length === 2) {
    if (getCardRank(cards[0]) === getCardRank(cards[1])) return CombinationType.DOUBLE;
  }

  if (cards.length === 3) {
    const r0 = getCardRank(cards[0]);
    if (cards.every(c => getCardRank(c) === r0)) return CombinationType.TRIPLE;
  }

  if (cards.length === 4) {
    const r0 = getCardRank(cards[0]);
    if (cards.every(c => getCardRank(c) === r0)) return CombinationType.QUAD;
  }

  if (cards.length >= 3) {
    const ranks = cards.map(getCardRank).sort((a, b) => a - b);
    const hasTwo = ranks.includes(12);
    if (!hasTwo) {
      let isConsecutive = true;
      for (let i = 1; i < ranks.length; i++) {
        if (ranks[i] !== ranks[i - 1] + 1) {
          isConsecutive = false;
          break;
        }
      }
      if (isConsecutive) return CombinationType.RUN;
    }
  }

  if (cards.length >= 6 && cards.length % 2 === 0) {
    const ranks = cards.map(getCardRank).sort((a, b) => a - b);
    const hasTwo = ranks.includes(12);
    if (!hasTwo) {
      let isValidDoubleRun = true;
      for (let i = 0; i < ranks.length; i += 2) {
        if (ranks[i] !== ranks[i + 1]) {
          isValidDoubleRun = false;
          break;
        }
        if (i > 0 && ranks[i] !== ranks[i - 2] + 1) {
          isValidDoubleRun = false;
          break;
        }
      }
      if (isValidDoubleRun) return CombinationType.DOUBLE_RUN;
    }
  }

  return null;
}

export function isLegalPlay(cards: PlayingCard[]): boolean {
  return getComboType(cards) !== null;
}

export function canPlay(played: PlayingCard[], nextPlay: PlayingCard[]): boolean {
  const nextType = getComboType(nextPlay);
  if (!nextType) return false;

  if (played.length === 0) return true;

  const playedType = getComboType(played);
  if (!playedType) return false;

  const getHighestCardIndex = (cards: PlayingCard[]) => {
    return Math.max(...cards.map(c => DECK.indexOf(c)));
  };

  const nextHighestIndex = getHighestCardIndex(nextPlay);
  const playedHighestIndex = getHighestCardIndex(played);

  if (nextType === playedType && nextPlay.length === played.length) {
    return nextHighestIndex > playedHighestIndex;
  }

  const isDeuces = played.every(c => c[0] === RANK_ORDER[12]);
  if (isDeuces) {
    const numDeuces = played.length;

    if (nextType === CombinationType.QUAD && numDeuces === 1) {
      return true;
    }

    if (nextType === CombinationType.DOUBLE_RUN) {
      const nextPairs = nextPlay.length / 2;
      if (nextPairs >= numDeuces + 2) {
        return true;
      }
    }
  }

  if (playedType === CombinationType.DOUBLE_RUN) {
    const playedPairs = played.length / 2;

    if (nextType === CombinationType.QUAD && playedPairs === 3) {
      return true;
    }

    if (nextType === CombinationType.DOUBLE_RUN && nextPlay.length > played.length) {
      return true;
    }
  }

  if (playedType === CombinationType.QUAD) {
    if (nextType === CombinationType.DOUBLE_RUN && nextPlay.length >= 8) {
      return true;
    }
  }

  return false;
}

export function isAutoWin(cards: PlayingCard[]): boolean {
  if (cards.length !== 13) return false;

  const counts = new Map<string, number>();
  for (const rank of RANK_ORDER) {
    counts.set(rank, 0);
  }
  for (const card of cards) {
    const rank = card[0];
    counts.set(rank, (counts.get(rank) || 0) + 1);
  }

  if (counts.get(RANK_ORDER[12]) === 4) return true;

  let isDragon = true;
  for (const rank of RANK_ORDER) {
    if (counts.get(rank) !== 1) {
      isDragon = false;
      break;
    }
  }
  if (isDragon) return true;

  let totalPairs = 0;
  for (const count of counts.values()) {
    totalPairs += Math.floor(count / 2);
  }
  if (totalPairs >= 6) return true;

  for (let i = 0; i <= RANK_ORDER.length - 5; i++) {
    let hasFiveConsecutive = true;
    for (let j = 0; j < 5; j++) {
      const rank = RANK_ORDER[i + j];
      if ((counts.get(rank) || 0) < 2) {
        hasFiveConsecutive = false;
        break;
      }
    }
    if (hasFiveConsecutive) return true;
  }

  let totalTriples = 0;
  for (const count of counts.values()) {
    if (count >= 3) {
      totalTriples++;
    }
  }
  if (totalTriples >= 4) return true;

  return false;
}

export const organizePlayerSeats = (players: (Player | boolean)[], mainPlayerId: string): Partial<Record<PlayerPosition, Player>> | undefined => {
  if (!mainPlayerId || !players.length) return {};

  let anchorIndex = players.findIndex(p => p && (p as Player).id === mainPlayerId);
  if (anchorIndex === -1 && players.length < 4) return;
  if (anchorIndex === -1) anchorIndex = 3;

  const newPlayerOrder = [];

  for (let i = 0; i < Math.max(players.length, 4); i++) {
    const index = (anchorIndex + i) % players.length;
    newPlayerOrder.push(players[index]);
  }

  const playerMap = newPlayerOrder.reduce(
    (p, c, i) => {
      const position = SEAT_MAP[i];
      p[position] = c;
      return p;
    },
    {} as Record<PlayerPosition, Player>,
  );

  return playerMap;
};
