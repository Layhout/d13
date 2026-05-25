import { HandIcon } from "@phosphor-icons/react";
import { PlayerProfile } from "./player-profile";
import { Button } from "./retroui/Button";
import { useGameContext } from "@/contexts/game-context";
import { Text } from "./retroui/Text";
import { CountdownWall } from "./countdown-wall";

export const PlayerStage = () => {
  const { northPlayer, eastPlayer, southPlayer, westPlayer, mainPlayer, toggleReady, readyCount, game, startGameCountdown, dealHands, isMainPlayerTurn, allowPlay, handlePass, handlePlay } =
    useGameContext();

  return (
    <>
      {northPlayer && (
        <div className="absolute top-[1%] left-[30%] justify-center">
          <PlayerProfile {...northPlayer} />
        </div>
      )}
      {eastPlayer && (
        <div className="absolute top-[25%] right-[1%] justify-center">
          <PlayerProfile {...eastPlayer} />
        </div>
      )}
      {southPlayer && !mainPlayer && (
        <div className="absolute bottom-[1%] right-[10%] justify-center">
          <PlayerProfile {...southPlayer} />
        </div>
      )}
      {westPlayer && (
        <div className="absolute bottom-[25%] left-[1%] justify-center">
          <PlayerProfile {...westPlayer} />
        </div>
      )}
      {mainPlayer && (
        <div className="absolute bottom-[23%] flex items-end gap-2 right-[10%]">
          {isMainPlayerTurn && (
            <>
              <Button className="bg-destructive text-white hover:bg-destructive/90" onClick={handlePass}>
                <HandIcon className="h-4 w-4 mr-2" weight="fill" /> Pass
              </Button>
              <Button className="" disabled={!allowPlay} onClick={handlePlay}>
                Play
              </Button>
            </>
          )}
          {game.status === "idle" && (
            <Button className="bg-green-600 text-white hover:bg-green-600/90" onClick={toggleReady}>
              {mainPlayer.isReady ? "Not Ready" : "Ready"}
            </Button>
          )}
          <PlayerProfile {...mainPlayer} />
        </div>
      )}
      {game?.status === "idle" && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4 justify-center text-white">
          <Text as="h2" className="text-center">
            All 4 Players need to be ready before game starts
          </Text>
          <Text as="h3">Ready Players: ({readyCount}/4)</Text>
        </div>
      )}
      {startGameCountdown && <CountdownWall onCountdownFinish={dealHands} />}
    </>
  );
};
