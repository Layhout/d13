import type { PlayingCard } from "@/lib/types";
import { getPlayingCardSize } from "@/lib/utils";
import { Layer } from "react-konva";
import { KonvaPlayingCard } from "./konva-playing-card";

interface Props {
  hand: PlayingCard[];
  onSelectCard: (card: PlayingCard) => void;
}

export const MainHand = ({ hand, onSelectCard }: Props) => {
  const { width, height } = getPlayingCardSize();

  return (
    <Layer x={window.innerWidth / 2 - (width + (hand.length - 1) * width * 0.5) / 2} y={window.innerHeight - height * 0.7}>
      {hand.map((card, index) => (
        <KonvaPlayingCard key={index} card={card} index={index} onSelect={onSelectCard} />
      ))}
    </Layer>
  );
};
