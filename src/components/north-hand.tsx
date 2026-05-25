import { useGameContext } from "@/contexts/game-context";
import { W_WIDTH } from "@/lib/constants";
import { getPlayingCardSize } from "@/lib/utils";
import { Layer } from "react-konva";
import { KonvaCustomImg } from "./konva-custom-img";

export const NorthHand = () => {
  const { northHand, isRevealCard } = useGameContext();
  const { width, height } = getPlayingCardSize(5);
  const cardCount = northHand.length;

  return (
    <Layer x={W_WIDTH / 2 - (width + (cardCount - 1) * width * 0.5) / 2} y={-(height * 0.3)}>
      {northHand
        .map((card, index) => (
          <KonvaCustomImg
            key={index}
            img={isRevealCard ? `/src/assets/cards/${card}.svg` : "/src/assets/cards/b.svg"}
            x={index * width * 0.5}
            y={0}
            width={width}
            height={height}
            shadowBlur={10}
            shadowOffset={{ x: 0, y: -10 }}
          />
        ))
        .reverse()}
    </Layer>
  );
};
