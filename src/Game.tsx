import { Navigate } from "react-router";
import { GameProvider } from "@/contexts/game-context";
import { W_HEIGHT, W_WIDTH } from "@/lib/constants";
import { Stage } from "react-konva";
import { PlayedHand } from "./components/played-hand";
import { NorthHand } from "./components/north-hand";
import { WestHand } from "./components/west-hand";
import { MainHand } from "./components/main-hand";
import { EastHand } from "./components/east-hand";
import { useAtomValue } from "jotai";
import { profileAtom } from "@/lib/atoms";
import { PlayerStage } from "./components/player-stage";
import { SouthHand } from "./components/south-hand";

export default function Game() {
  const profile = useAtomValue(profileAtom);

  if (!profile) return <Navigate to="/" />;

  return (
    <GameProvider>
      <div className="base-background">
        <div className="relative">
          <Stage width={W_WIDTH} height={W_HEIGHT}>
            <PlayedHand />
            <NorthHand />
            <WestHand />
            <MainHand />
            <SouthHand />
            <EastHand />
          </Stage>
          <PlayerStage />
        </div>
      </div>
    </GameProvider>
  );
}
