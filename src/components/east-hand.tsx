import { W_WIDTH } from "@/lib/constants";
import { getPlayingCardSize } from "@/lib/utils";
import { Image, Layer } from "react-konva";
import useImage from "use-image";

export const EastHand = () => {
  const { width, height } = getPlayingCardSize(5);
  const cardCount = 13;
  const [image] = useImage("/src/assets/cards/b.svg");

  return (
    <Layer rotation={90} x={W_WIDTH + height * 0.3} y={window.innerHeight / 2 - (width + (cardCount - 1) * width * 0.5) / 2}>
      {Array.from({ length: cardCount }, (_, index) => (
        <Image key={index} image={image} x={index * width * 0.5} y={0} width={width} height={height} shadowBlur={10} shadowOffset={{ x: 10, y: 0 }} />
      )).reverse()}
    </Layer>
  );
};
