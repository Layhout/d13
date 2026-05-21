import { Navigate, useParams } from "react-router";
import { GameProvider } from "@/contexts/game-context";
import { W_HEIGHT, W_WIDTH } from "@/lib/constants";
import { Stage } from "react-konva";
import { PlayedHand } from "./components/played-hand";
import { NorthHand } from "./components/north-hand";
import { WestHand } from "./components/west-hand";
import { MainHand } from "./components/main-hand";
import { EastHand } from "./components/east-hand";
import { PlayerProfile } from "./components/player-profile";
import { getRandomAvatarName } from "@/lib/utils";
import { HandIcon } from "@phosphor-icons/react";
import { Button } from "./components/retroui/Button";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { Loader } from "./components/retroui/Loader";

export default function Game() {
  const { gameId } = useParams();
  const [user, loading] = useAuthState(auth);
  console.log(gameId);

  if (loading)
    return (
      <div className="base-background flex justify-center items-center">
        <Loader size="lg" />
      </div>
    );

  if (!user && !loading) return <Navigate to="/" />;

  return (
    <GameProvider>
      <div className="base-background">
        <Stage width={W_WIDTH} height={W_HEIGHT}>
          <PlayedHand />
          <NorthHand />
          <WestHand />
          <MainHand />
          {/* <SouthHand/> */}
          <EastHand />
        </Stage>
        <div className="absolute top-[1%] left-[30%] justify-center">
          <PlayerProfile avatarName={getRandomAvatarName()} name="Layhout" isPassed placed="1" />
        </div>
        <div className="absolute top-[25%] right-[1%] justify-center">
          <PlayerProfile avatarName={getRandomAvatarName()} name="Layhout" isOffline placed="2" />
        </div>
        <div className="absolute bottom-[25%] left-[1%] justify-center">
          <PlayerProfile avatarName={getRandomAvatarName()} name="Layhout" placed="3" isReady />
        </div>
        <div className="absolute bottom-[23%] flex items-end gap-2 right-[10%]">
          <Button className="bg-destructive text-white hover:bg-destructive/90">
            <HandIcon className="h-4 w-4 mr-2" weight="fill" /> Pass
          </Button>
          <Button className="">Play</Button>
          <Button className="bg-green-600 text-white hover:bg-green-600/90">Ready</Button>
          <PlayerProfile avatarName={getRandomAvatarName()} name="Layhout" isTurn placed="4" />
        </div>
      </div>
    </GameProvider>
  );
}
