import { Layer, Rect, Stage } from "react-konva";
import { KonvaPlayingCard } from "./components/KonvaPlayingCard";
import { dealCards, getPlayingCardSize, sortHand } from "@/lib/utils";
import { useState } from "react";
import type { PlayingCard } from "@/lib/types";

export default function App() {
  const { width, height } = getPlayingCardSize();

  const [hand] = useState<PlayingCard[]>(() => {
    const { hand1 } = dealCards();
    return sortHand(hand1).slice(0, 13);
  });

  return (
    <div className="">
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer x={window.innerWidth / 2 - (width + (hand.length - 1) * width * 0.5) / 2} y={window.innerHeight - height * 0.7}>
          {hand.map((card, index) => (
            <KonvaPlayingCard key={index} card={card} index={index} />
          ))}
        </Layer>
        <Layer>
          <Rect x={window.innerWidth / 2 - 1} y={0} height={window.innerHeight} fill="red" width={2} />
        </Layer>
      </Stage>
    </div>
  );
}
