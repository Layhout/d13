import { type PlayingCard } from "@/lib/types";
import { getPlayingCardSize } from "@/lib/utils";
import type Konva from "konva";
import { useEffect, useRef } from "react";
import { Image } from "react-konva";
import useImage from "use-image";

interface Props {
  card: PlayingCard;
  x?: number;
  y?: number;
  index?: number;
  sizePercentage?: number;
  isSelected?: boolean;
  onSelect?: (card: PlayingCard) => void;
}

export const KonvaPlayingCard = ({ card, x = 0, y = 0, index = 0, sizePercentage, isSelected, onSelect }: Props) => {
  const r = useRef<Konva.Image>(null);
  const [image] = useImage(`/src/assets/cards/${card}.svg`);
  const { width, height } = getPlayingCardSize(sizePercentage);

  const handleMouseEnter = () => {
    if (isSelected || !onSelect) return;
    r.current?.to({
      y: y - 20,
      duration: 0.1,
    });
  };

  const handleMouseLeave = () => {
    if (isSelected || !onSelect) return;
    r.current?.to({
      y: y,
      duration: 0.1,
    });
  };

  const handleClick = () => {
    if (!onSelect) return;
    onSelect(card);
  };

  useEffect(() => {
    if (isSelected) {
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
  }, [isSelected, y]);

  return (
    <Image
      ref={r}
      image={image}
      x={x + index * width * 0.5}
      y={y}
      width={width}
      height={height}
      shadowBlur={10}
      shadowOpacity={0.5}
      shadowOffset={{ x: 0, y: 10 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    />
  );
};
