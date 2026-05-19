import { type PlayingCard } from "@/lib/types";
import { getPlayingCardSize } from "@/lib/utils";
import type Konva from "konva";
import { useRef } from "react";
import { Image } from "react-konva";
import useImage from "use-image";

interface Props {
  card: PlayingCard;
  x?: number;
  y?: number;
  index?: number;
}

export const KonvaPlayingCard = ({ card, x = 0, y = 0, index = 0 }: Props) => {
  const r = useRef<Konva.Image>(null);
  const isSelected = useRef<boolean>(false);
  const [image] = useImage(`/src/assets/cards/${card}.svg`);
  const { width, height } = getPlayingCardSize();

  const handleMouseEnter = () => {
    if (isSelected.current) return;
    r.current?.to({
      y: y - 20,
      duration: 0.1,
    });
  };

  const handleMouseLeave = () => {
    if (isSelected.current) return;
    r.current?.to({
      y: y,
      duration: 0.1,
    });
  };

  const handleClick = () => {
    isSelected.current = !isSelected.current;
    if (isSelected.current) {
      r.current?.to({
        y: y - 50,
        duration: 0.1,
      });
    } else {
      r.current?.to({
        y: y,
        duration: 0.1,
      });
    }
  };

  return (
    <Image
      ref={r}
      image={image}
      x={x + index * width * 0.5}
      y={y}
      width={width}
      height={height}
      shadowBlur={10}
      shadowColor="#000"
      shadowOffset={{ x: 0, y: 10 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    />
  );
};
