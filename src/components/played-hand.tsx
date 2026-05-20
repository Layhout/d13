import { getPlayingCardSize } from "@/lib/utils";
import type { PlayerPosition, PlayingCard } from "@/lib/types";
import { Layer } from "react-konva";
import { useEffect, useRef } from "react";
import Konva from "konva";
import { KonvaPlayingCard } from "./konva-playing-card";

interface Props {
  cards: PlayingCard[];
  position: PlayerPosition;
}

export const PlayedHand = ({ cards, position }: Props) => {
  const r = useRef<Konva.Layer>(null);
  const tweenRef = useRef<Konva.Tween>(null);
  const { width, height } = getPlayingCardSize();

  useEffect(() => {
    if (!r.current || !cards.length) return;

    // Calculate target position (center of the screen)
    const targetX = window.innerWidth / 2 - (width + (cards.length - 1) * width * 0.5) / 2;
    const targetY = window.innerHeight / 2 - height / 2;

    // Calculate initial position (off-screen) based on player position
    let initX = 0;
    let initY = 0;

    switch (position) {
      case "N":
        initX = targetX;
        initY = -height;
        break;
      case "E":
        initX = window.innerWidth;
        initY = targetY;
        break;
      case "S":
        initX = targetX;
        initY = window.innerHeight;
        break;
      case "W":
        initX = -(width + (cards.length - 1) * width * 0.5);
        initY = targetY;
        break;
    }

    // Stop and destroy any existing tween to avoid animation overlap
    if (tweenRef.current) {
      tweenRef.current.destroy();
      tweenRef.current = null;
    }

    // Set initial position immediately on the Konva node
    r.current.x(initX);
    r.current.y(initY);

    // Create and play the new tween
    tweenRef.current = new Konva.Tween({
      node: r.current,
      x: targetX,
      y: targetY,
      duration: 0.3,
      easing: Konva.Easings.EaseOut,
    });

    tweenRef.current.play();

    return () => {
      if (tweenRef.current) {
        tweenRef.current.destroy();
        tweenRef.current = null;
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards]);

  if (!cards.length) return null;

  return (
    <Layer ref={r} height={height}>
      {cards.map((card, index) => (
        <KonvaPlayingCard key={index} card={card} index={index} />
      ))}
    </Layer>
  );
};
