import type { PlayerPosition, PlayingCard } from "@/lib/types";
import { dealCards, sortHand } from "@/lib/utils";
import { type PropsWithChildren, createContext, use, useRef, useState } from "react";

export interface GameContextValues {
  mainHand: PlayingCard[];
  northHand: PlayingCard[];
  eastHand: PlayingCard[];
  southHand: PlayingCard[];
  westHand: PlayingCard[];
  playedCards: PlayingCard[];
  turn: PlayerPosition;
  onSelectCard: (card: PlayingCard) => void;
}

const GameContext = createContext<GameContextValues | null>(null);

export function useGameContext() {
  const context = use(GameContext);
  if (!context) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
}

export function GameProvider({ children }: PropsWithChildren) {
  const [hand] = useState<PlayingCard[]>(() => {
    const { hand1 } = dealCards();
    return sortHand(hand1);
  });
  const [playedCards] = useState<PlayingCard[]>([]);
  const [turn] = useState<PlayerPosition>("N");

  const selectedCards = useRef<PlayingCard[]>([]);

  const onSelectCard = (card: PlayingCard) => {
    if (selectedCards.current.includes(card)) {
      selectedCards.current = selectedCards.current.filter(c => c !== card);
    } else {
      selectedCards.current.push(card);
    }
  };

  return (
    <GameContext
      value={{
        mainHand: hand,
        northHand: [],
        eastHand: [],
        southHand: [],
        westHand: [],
        playedCards,
        turn,
        onSelectCard: onSelectCard,
      }}
    >
      {children}
    </GameContext>
  );
}
