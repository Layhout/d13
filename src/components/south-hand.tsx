import { useGameContext } from "@/contexts/game-context";
import { getPlayingCardSize } from "@/lib/utils";
import { Layer } from "react-konva";
import { KonvaCustomImg } from "./konva-custom-img";

export const SouthHand = () => {
  const { southHand, mainHand, isRevealCard } = useGameContext();
  const { width, height } = getPlayingCardSize(5);
  const cardCount = southHand.length;

  if (mainHand.length) return null;

  return (
    <Layer x={window.innerWidth / 2 - (width + (cardCount - 1) * width * 0.5) / 2} y={window.innerHeight - height * 0.7}>
      {southHand
        .map((card, index) => (
          <KonvaCustomImg
            key={index}
            img={isRevealCard ? `/src/assets/cards/${card}.svg` : "/src/assets/cards/b.svg"}
            x={index * width * 0.5}
            y={0}
            width={width}
            height={height}
            shadowBlur={10}
            shadowOffset={{ x: 0, y: 10 }}
          />
        ))
        .reverse()}
    </Layer>
  );
};
