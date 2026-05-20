import { Stage } from "react-konva";
import { dealCards, sortHand } from "@/lib/utils";
import { useRef, useState } from "react";
import type { PlayerPosition, PlayingCard } from "@/lib/types";
import { MainHand } from "./components/main-hand";
import { NorthHand } from "./components/north-hand";
import { WestHand } from "./components/west-hand";
import { EastHand } from "./components/east-hand";
import { PlayedHand } from "./components/played-hand";
import { Button } from "./components/retroui/Button";

export default function App() {
  const [hand] = useState<PlayingCard[]>(() => {
    const { hand1 } = dealCards();
    return sortHand(hand1);
  });
  const [played, setPlayed] = useState<PlayingCard[]>([]);
  const [position, setPosition] = useState<PlayerPosition>("N");

  const selectedCards = useRef<PlayingCard[]>([]);

  const onSelectCard = (card: PlayingCard) => {
    if (selectedCards.current.includes(card)) {
      selectedCards.current = selectedCards.current.filter(c => c !== card);
    } else {
      selectedCards.current.push(card);
    }
  };

  return (
    <div className="relative bg-[#35654d] before:absolute before:inset-0 before:bg-[url(/src/assets/grain.png)] before:bg-repeat before:opacity-10">
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <PlayedHand cards={played} position={position} />
        <NorthHand />
        <WestHand />
        <MainHand hand={hand} onSelectCard={onSelectCard} />
        <EastHand />
      </Stage>
      <Button
        className="absolute top-4 left-4"
        onClick={() => {
          console.log(selectedCards.current);

          setPlayed(sortHand(selectedCards.current.slice()));
          selectedCards.current = [];
        }}
      >
        test
      </Button>
      <Button
        className="absolute top-16 left-4"
        onClick={() => {
          setPosition("N");
        }}
      >
        N
      </Button>
      <Button
        className="absolute top-28 left-4"
        onClick={() => {
          setPosition("E");
        }}
      >
        E
      </Button>
      <Button
        className="absolute top-40 left-4"
        onClick={() => {
          setPosition("S");
        }}
      >
        S
      </Button>
      <Button
        className="absolute top-52 left-4"
        onClick={() => {
          setPosition("W");
        }}
      >
        W
      </Button>
    </div>
  );
}
