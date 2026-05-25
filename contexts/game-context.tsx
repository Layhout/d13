import { profileAtom } from "@/lib/atoms";
import { SEAT_MAP } from "@/lib/constants";
import { listen, update } from "@/lib/realtime";
import { PlayerPosition, type Game, type PlayingCard, type Player } from "@/lib/types";
import { canPlay, dealCards, isLegalPlay, organizePlayerHands, organizePlayerSeats } from "@/lib/utils";
import { useAtomValue } from "jotai";
import { type PropsWithChildren, createContext, use, useEffect, useReducer } from "react";
import { useParams } from "react-router";

export interface GameContextValues {
  mainHand: PlayingCard[];

  northHand: PlayingCard[];
  eastHand: PlayingCard[];
  southHand: PlayingCard[];
  westHand: PlayingCard[];

  playedCards: PlayingCard[];
  turn: PlayerPosition;

  northPlayer?: Player;
  eastPlayer?: Player;
  southPlayer?: Player;
  westPlayer?: Player;

  mainPlayer?: Player;
  readyCount: number;
  game?: Game;
  startGameCountdown: boolean;
  isMainPlayerTurn: boolean;
  selectedCards: PlayingCard[];
  allowPlay: boolean;
  isRevealCard: boolean;

  onSelectCard: (card: PlayingCard) => void;
  toggleReady: () => void;
  dealHands: () => void;
  handlePass: () => void;
  handlePlay: () => void;
}

const GameContext = createContext<GameContextValues | null>(null);

export function useGameContext() {
  const context = use(GameContext);
  if (!context) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
}

interface GameState {
  playedCards: PlayingCard[];
  turn: PlayerPosition;
  isMainPlayerTurn: boolean;
  playerMap: Partial<Record<PlayerPosition, Player>>;
  handsBySeat: Partial<Record<PlayerPosition, PlayingCard[]>>;
  mainPlayer: Player | undefined;
  mainHand: PlayingCard[];
  game: Game | null;
  readyCount: number;
  startGameCountdown: boolean;
  selectedCards: PlayingCard[];
  allowPlay: boolean;
  isRevealCard: boolean;
}

type GameStateAction =
  | { type: "init"; payload: Partial<GameState> }
  | { type: "start-countdown"; payload: boolean }
  | { type: "select-card"; payload: PlayingCard }
  | { type: "allow-play"; payload: boolean }
  | { type: "clear-selected-card" }
  | { type: "next-turn" }
  | { type: "reveal-card"; payload: boolean };

function reducer(state: GameState, action: GameStateAction): GameState {
  switch (action.type) {
    case "init":
      return { ...state, ...action.payload };
    case "start-countdown":
      return { ...state, startGameCountdown: action.payload };
    case "select-card": {
      const { selectedCards } = state;
      const card = action.payload;
      if (selectedCards.includes(card)) {
        return { ...state, selectedCards: selectedCards.filter(c => c !== card) };
      } else {
        return { ...state, selectedCards: [...selectedCards, card] };
      }
    }
    case "allow-play": {
      return { ...state, allowPlay: action.payload };
    }
    case "clear-selected-card": {
      return { ...state, selectedCards: [] };
    }
    case "next-turn": {
      const currentTurn = Object.keys(SEAT_MAP).find(k => SEAT_MAP[k] === state.turn);
      const nextTurn = (Number(currentTurn) + 1) % 4;
      return { ...state, turn: SEAT_MAP[nextTurn] };
    }
    case "reveal-card": {
      return { ...state, isRevealCard: action.payload };
    }
    default:
      return state;
  }
}

export function GameProvider({ children }: PropsWithChildren) {
  const { gameId } = useParams();

  const [state, dispatch] = useReducer<GameState, [GameStateAction]>(reducer, {
    playedCards: [],
    turn: PlayerPosition.NORTH,
    playerMap: {},
    mainPlayer: undefined,
    mainHand: [],
    game: null,
    readyCount: 0,
    startGameCountdown: false,
    isMainPlayerTurn: false,
    handsBySeat: {},
    selectedCards: [],
    allowPlay: false,
    isRevealCard: false,
  });

  const { playedCards, turn, playerMap, mainPlayer, mainHand, game, readyCount, startGameCountdown, handsBySeat, isMainPlayerTurn, selectedCards, allowPlay, isRevealCard } = state;

  const profile = useAtomValue(profileAtom);

  const onSelectCard = (card: PlayingCard) => {
    dispatch({ type: "select-card", payload: card });
  };

  const toggleReady = () => {
    if (!game) return;

    const foundProfileIndex = game.players.findIndex(p => p?.id === profile?.id);
    if (foundProfileIndex === -1) return;

    const allPlayer = game.players.slice();
    allPlayer[foundProfileIndex] = { ...allPlayer[foundProfileIndex], isReady: !allPlayer[foundProfileIndex].isReady };
    const isAllPlayerReady = allPlayer.every(p => p?.isReady);
    const updates: Record<string, unknown> = { [`game/${gameId}/players/${foundProfileIndex}/isReady`]: allPlayer[foundProfileIndex].isReady };

    if (isAllPlayerReady) updates[`game/${gameId}/status`] = "start";
    update(updates);
  };

  const dealHands = () => {
    dispatch({ type: "start-countdown", payload: false });
    const isFirstPlayer = game?.players.findIndex(p => p?.id === profile?.id) === 0;
    console.log("isFirstPlayer", isFirstPlayer, profile?.id);

    if (!isFirstPlayer) return;

    const { hand0, hand1, hand2, hand3 } = dealCards();
    const turnIndex = [hand0, hand1, hand2, hand3].findIndex(h => h.includes("3s"));
    const resetReadyPlayer = game?.players.reduce(
      (p, _, i) => {
        p[`game/${gameId}/players/${i}/isReady`] = false;
        if (turnIndex === i) p[`game/${gameId}/players/${i}/isTurn`] = true;
        return p;
      },
      {} as Record<string, boolean>,
    );
    console.log(turnIndex, resetReadyPlayer);

    update({
      [`game/${gameId}/hands`]: [hand0, hand1, hand2, hand3],
      [`game/${gameId}/status`]: "ongoing",
      ...resetReadyPlayer,
    });
  };

  const handlePass = () => {
    if (!game) return;

    const foundProfileIndex = game.players.findIndex(p => p?.id === profile?.id);
    if (foundProfileIndex === -1) return;

    let nextTurnIndex: number | null = null;
    for (let i = foundProfileIndex + 1; i < 10; i++) {
      const currentIndex = i % 4;
      if (!game.players[currentIndex]?.isPass) {
        nextTurnIndex = currentIndex;
        break;
      }
    }
    const notPassPlayerCount = game.players.filter(p => !p?.isPass).length;
    const nextTurn = game.players.findIndex(p => p && !p?.isPass && p.id !== profile?.id);

    const updates = {};

    if (notPassPlayerCount === 2) {
      updates[`game/${gameId}/played`] = false;
      game.players.forEach((_, i) => {
        updates[`game/${gameId}/players/${i}/isPass`] = false;
      });
      updates[`game/${gameId}/players/${nextTurn}/isTurn`] = true;
      updates[`game/${gameId}/players/${foundProfileIndex}/isTurn`] = false;
    } else {
      updates[`game/${gameId}/players/${nextTurnIndex}/isTurn`] = true;
      updates[`game/${gameId}/players/${foundProfileIndex}/isTurn`] = false;
      updates[`game/${gameId}/players/${foundProfileIndex}/isPass`] = true;
    }

    update(updates);
  };

  const handlePlay = () => {
    if (!game) return;
    const foundProfileIndex = game.players.findIndex(p => p?.id === profile?.id);
    if (foundProfileIndex === -1) return;

    const newMainHand = mainHand.filter(card => !selectedCards.includes(card));

    let nextTurnIndex: number | null = null;
    for (let i = foundProfileIndex + 1; i < 10; i++) {
      const currentIndex = i % 4;
      if (!game.players[currentIndex]?.isPass) {
        nextTurnIndex = currentIndex;
        break;
      }
    }

    const updates: Record<string, unknown> = {
      [`game/${gameId}/played`]: selectedCards,
      [`game/${gameId}/hands/${foundProfileIndex}`]: newMainHand,
    };

    if (foundProfileIndex === nextTurnIndex) {
      updates[`game/${gameId}/played`] = false;
      game.players.forEach((_, i) => {
        updates[`game/${gameId}/players/${i}/isPass`] = false;
      });
    } else {
      updates[`game/${gameId}/players/${nextTurnIndex}/isTurn`] = true;
      updates[`game/${gameId}/players/${foundProfileIndex}/isTurn`] = false;
    }

    update(updates);

    dispatch({ type: "clear-selected-card" });
  };

  useEffect(() => {
    const unsub = listen<Game>(`game/${gameId}`, data => {
      const playerBySeat = organizePlayerSeats(data.players as (Player | boolean)[], profile?.id || "");
      const mainPlayerIndex = data.players.findIndex(p => p.id === profile?.id);
      const handsBySeat = organizePlayerHands(data.hands as (PlayingCard[] | boolean)[], mainPlayerIndex === -1 ? 3 : mainPlayerIndex);
      const readyCount = data.players.filter(p => p?.isReady).length;
      const isMainPlayerTurn = data.players.find(p => p?.id === profile?.id)?.isTurn || false;
      const currentTurn = Object.keys(playerBySeat).find(k => playerBySeat[k]?.isTurn) as PlayerPosition;
      const seatOrder = Object.values(SEAT_MAP);

      dispatch({
        type: "init",
        payload: {
          game: data,
          playerMap: playerBySeat,
          mainPlayer: mainPlayerIndex !== -1 ? playerBySeat[PlayerPosition.SOUTH] : undefined,
          readyCount,
          playedCards: data.played || [],
          handsBySeat,
          isMainPlayerTurn,
          startGameCountdown: data.status === "start",
          mainHand: mainPlayerIndex !== -1 ? handsBySeat[PlayerPosition.SOUTH] : [],
          turn: seatOrder[(seatOrder.indexOf(currentTurn) - 1) % 4],
        },
      });
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

    return () => {
      controller.abort();
    };
  }, [game?.players, gameId, profile?.id]);

  useEffect(() => {
    const isLegal = isLegalPlay(selectedCards);
    if (!isLegal) {
      dispatch({ type: "allow-play", payload: false });
      return;
    }

    const isCanPlay = canPlay(game?.played || [], selectedCards);
    dispatch({ type: "allow-play", payload: isCanPlay });
  }, [game?.played, selectedCards]);

  return (
    <GameContext
      value={{
        mainHand,
        northHand: handsBySeat[PlayerPosition.NORTH] || [],
        eastHand: handsBySeat[PlayerPosition.EAST] || [],
        southHand: handsBySeat[PlayerPosition.SOUTH] || [],
        westHand: handsBySeat[PlayerPosition.WEST] || [],
        playedCards,
        turn,
        northPlayer: playerMap[PlayerPosition.NORTH],
        eastPlayer: playerMap[PlayerPosition.EAST],
        southPlayer: playerMap[PlayerPosition.SOUTH],
        westPlayer: playerMap[PlayerPosition.WEST],
        mainPlayer,
        readyCount,
        game,
        startGameCountdown,
        isMainPlayerTurn,
        selectedCards,
        allowPlay,
        isRevealCard,
        onSelectCard,
        toggleReady,
        dealHands,
        handlePass,
        handlePlay,
      }}
    >
      {children}
    </GameContext>
  );
}
