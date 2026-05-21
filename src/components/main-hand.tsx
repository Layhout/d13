import { W_HEIGHT, W_WIDTH } from "@/lib/constants";
import { getPlayingCardSize } from "@/lib/utils";
import { Layer } from "react-konva";
import { KonvaPlayingCard } from "./konva-playing-card";
import { useGameContext } from "@/contexts/game-context";

export const MainHand = () => {
  const { mainHand, onSelectCard } = useGameContext();
  const { width, height } = getPlayingCardSize();

  return (
    <Layer x={W_WIDTH / 2 - (width + (mainHand.length - 1) * width * 0.5) / 2} y={W_HEIGHT - height * 0.7}>
      {mainHand.map((card, index) => (
        <KonvaPlayingCard key={index} card={card} index={index} onSelect={onSelectCard} />
      ))}
    </Layer>
  );
};
