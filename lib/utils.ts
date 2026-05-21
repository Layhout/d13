import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { AVATAR_NAMES, CARD_ASPECT_RATIO, DECK, DEFAULT_CARD_SIZE_PERCENT, RANK_ORDER } from "./constants";
import { CombinationType, type PlayingCard } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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

  const getCardRank = (card: PlayingCard) => RANK_ORDER.indexOf(card[0]);

  // Solo: 1 card
  if (cards.length === 1) return CombinationType.SOLO;

  // Doubles: 2 cards of the same value
  if (cards.length === 2) {
    if (getCardRank(cards[0]) === getCardRank(cards[1])) return CombinationType.DOUBLE;
  }

  // Triples: 3 cards of the same value
  if (cards.length === 3) {
    const r0 = getCardRank(cards[0]);
    if (cards.every(c => getCardRank(c) === r0)) return CombinationType.TRIPLE;
  }

  // Quads: 4 cards of the same value
  if (cards.length === 4) {
    const r0 = getCardRank(cards[0]);
    if (cards.every(c => getCardRank(c) === r0)) return CombinationType.QUAD;
  }

  // Runs: 3 or more cards that run in sequence (no 2s)
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

  // Double runs: 2 sets of 3 or more cards that have the same straight-number sequence (no 2s)
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

  // 1. Standard Case: Same combination type and same number of cards
  if (nextType === playedType && nextPlay.length === played.length) {
    return nextHighestIndex > playedHighestIndex;
  }

  // 2. Chop and Bomb exceptions (special beats)

  // A. Beating Deuces (2s)
  const isDeuces = played.every(c => c[0] === "2");
  if (isDeuces) {
    const numDeuces = played.length;

    // A Quad (four-of-a-kind) can beat a single 2
    if (nextType === CombinationType.QUAD && numDeuces === 1) {
      return true;
    }

    // A Double Run of P pairs (length 2 * P) can beat `numDeuces` deuces if P >= numDeuces + 2
    if (nextType === CombinationType.DOUBLE_RUN) {
      const nextPairs = nextPlay.length / 2;
      if (nextPairs >= numDeuces + 2) {
        return true;
      }
    }
  }

  // B. Beating a played Double Run
  if (playedType === CombinationType.DOUBLE_RUN) {
    const playedPairs = played.length / 2;

    // A Quad can beat a 3-pair double run
    if (nextType === CombinationType.QUAD && playedPairs === 3) {
      return true;
    }

    // A larger Double Run (at least 4 pairs if played was 3, etc.) can beat it
    if (nextType === CombinationType.DOUBLE_RUN && nextPlay.length > played.length) {
      return true;
    }
  }

  // C. Beating a played Quad
  if (playedType === CombinationType.QUAD) {
    // A Double Run of at least 4 pairs (length >= 8) can beat a Quad
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

  // 1. Four 2s (four deuces)
  if (counts.get("2") === 4) return true;

  // 2. Dragon Run (Rồng): 13 consecutive cards (ranks 3 to 2)
  let isDragon = true;
  for (const rank of RANK_ORDER) {
    if (counts.get(rank) !== 1) {
      isDragon = false;
      break;
    }
  }
  if (isDragon) return true;

  // 3. Six Pairs (any 6 pairs)
  let totalPairs = 0;
  for (const count of counts.values()) {
    totalPairs += Math.floor(count / 2);
  }
  if (totalPairs >= 6) return true;

  // 4. Five Consecutive Pairs (consecutive double run of 5 pairs)
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

  // 5. Four Triples (four three-of-a-kinds)
  let totalTriples = 0;
  for (const count of counts.values()) {
    if (count >= 3) {
      totalTriples++;
    }
  }
  if (totalTriples >= 4) return true;

  return false;
}
