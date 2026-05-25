import { HandIcon } from "@phosphor-icons/react";
import { PlayerProfile } from "./player-profile";
import { Button } from "./retroui/Button";
import { useGameContext } from "@/contexts/game-context";

export const PlayerStage = () => {
  const { northPlayer, eastPlayer, southPlayer, westPlayer, mainPlayer } = useGameContext();

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
          <Button className="bg-destructive text-white hover:bg-destructive/90">
            <HandIcon className="h-4 w-4 mr-2" weight="fill" /> Pass
          </Button>
          <Button className="">Play</Button>
          <Button className="bg-green-600 text-white hover:bg-green-600/90">Ready</Button>
          <PlayerProfile {...mainPlayer} />
        </div>
      )}
    </>
  );
};
