import { getPlayingCardSize } from "@/lib/utils";
import { Image, Layer } from "react-konva";
import useImage from "use-image";

export const NorthHand = () => {
  const { width, height } = getPlayingCardSize(5);
  const cardCount = 13;
  const [image] = useImage("/src/assets/cards/b.svg");

  return (
    <Layer x={window.innerWidth / 2 - (width + (cardCount - 1) * width * 0.5) / 2} y={-(height * 0.3)}>
      {Array.from({ length: cardCount }, (_, index) => (
        <Image key={index} image={image} x={index * width * 0.5} y={0} width={width} height={height} shadowBlur={10} shadowOffset={{ x: 0, y: -10 }} />
      )).reverse()}
    </Layer>
  );
};
