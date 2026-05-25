import { profileAtom } from "@/lib/atoms";
import { listen, write } from "@/lib/realtime";
import { PlayerPosition, type Game, type PlayingCard, type Player } from "@/lib/types";
import { organizePlayerSeats } from "@/lib/utils";
import { useAtomValue } from "jotai";
import { type PropsWithChildren, createContext, use, useRef, useState, useEffect, useReducer } from "react";
import { useParams } from "react-router";
import { useUnmount } from "@/hooks/use-unmount";

export interface GameContextValues {
  mainHand: PlayingCard[];

  northHand: PlayingCard[];
  eastHand: PlayingCard[];
  southHand: PlayingCard[];
  westHand: PlayingCard[];

  playedCards: PlayingCard[];
  turn: PlayerPosition;
  onSelectCard: (card: PlayingCard) => void;

  northPlayer?: Player;
  eastPlayer?: Player;
  southPlayer?: Player;
  westPlayer?: Player;

  mainPlayer?: Player;
}

const GameContext = createContext<GameContextValues | null>(null);

export function useGameContext() {
  const context = use(GameContext);
  if (!context) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
}

// interface GameState {
//   hand: PlayingCard[];
//   playedCards: PlayingCard[];
//   turn: PlayerPosition;
//   playerMap: Partial<Record<PlayerPosition, Player>>;
//   mainPlayer: Player | undefined;
//   game: Game | null;
// }

type GameStateAction = { type: "up" } | { type: "down" };

function reducer(state: { count: number }, action: GameStateAction): { count: number } {
  switch (action.type) {
    case "up":
      return { ...state, count: state.count + 1 };
    case "down":
      return { ...state, count: state.count - 1 };
    default:
      return state;
  }
}

export function GameProvider({ children }: PropsWithChildren) {
  const { gameId } = useParams();

  const [state, dispatch] = useReducer<{ count: number }, [GameStateAction]>(reducer, { count: 0 });

  const [hand] = useState<PlayingCard[]>(() => {
    // const { hand1 } = dealCards();
    // return sortHand(hand1);
    return [];
  });
  const [playedCards] = useState<PlayingCard[]>([]);
  const [turn] = useState<PlayerPosition>(PlayerPosition.NORTH);
  const [game, setGame] = useState<Game>();

  const [playerMap, setPlayerMap] = useState<Partial<Record<PlayerPosition, Player>>>({});
  const [mainPlayer, setMainPlayer] = useState<Player | undefined>();

  const profile = useAtomValue(profileAtom);

  const selectedCards = useRef<PlayingCard[]>([]);

  const onSelectCard = (card: PlayingCard) => {
    if (selectedCards.current.includes(card)) {
      selectedCards.current = selectedCards.current.filter(c => c !== card);
    } else {
      selectedCards.current.push(card);
    }
  };

  const removePlayer = () => {
    const foundProfileIndex = game?.players.findIndex(p => p?.id === profile?.id);

    if (foundProfileIndex !== undefined && foundProfileIndex !== -1) {
      write(`game/${gameId}/players/${foundProfileIndex}`, false);
    }
  };

  useEffect(() => {
    const unsub = listen<Game>(`game/${gameId}`, data => {
      setGame(data);
      const playerBySeat = organizePlayerSeats(data.players as (Player | boolean)[], profile?.id || "");
      setPlayerMap(playerBySeat);
      setMainPlayer(playerBySeat[PlayerPosition.SOUTH]);
    });

    return () => unsub();
  }, [gameId, profile?.id]);

  useEffect(() => {
    const controller = new AbortController();

    window.addEventListener(
      "beforeunload",
      e => {
        e.preventDefault();
        e.returnValue = "";
      },
      { signal: controller.signal },
    );

    window.addEventListener("unload", removePlayer, { signal: controller.signal });

    return () => {
      controller.abort();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game?.players, gameId, profile?.id]);

  useUnmount(() => {
    removePlayer();
  });

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
        northPlayer: playerMap[PlayerPosition.NORTH],
        eastPlayer: playerMap[PlayerPosition.EAST],
        southPlayer: playerMap[PlayerPosition.SOUTH],
        westPlayer: playerMap[PlayerPosition.WEST],
        mainPlayer,
      }}
    >
      {children}
    </GameContext>
  );
}
