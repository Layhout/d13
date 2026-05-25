import { useGameContext } from "@/contexts/game-context";
import { getPlayingCardSize } from "@/lib/utils";
import { Layer } from "react-konva";
import { KonvaCustomImg } from "./konva-custom-img";

export const WestHand = () => {
  const { westHand, isRevealCard } = useGameContext();
  const { width, height } = getPlayingCardSize(5);
  const cardCount = westHand.length;

  return (
    <Layer rotation={90} x={height * 0.7} y={window.innerHeight / 2 - (width + (cardCount - 1) * width * 0.5) / 2}>
      {westHand.map((card, index) => (
        <KonvaCustomImg
          key={index}
          img={isRevealCard ? `/src/assets/cards/${card}.svg` : "/src/assets/cards/b.svg"}
          x={index * width * 0.5}
          y={0}
          width={width}
          height={height}
          shadowBlur={10}
          shadowOffset={{ x: -10, y: 0 }}
        />
      ))}
    </Layer>
  );
};
