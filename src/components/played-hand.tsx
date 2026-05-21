import { getPlayingCardSize } from "@/lib/utils";
import { Layer } from "react-konva";
import { useEffect, useRef } from "react";
import Konva from "konva";
import { KonvaPlayingCard } from "./konva-playing-card";
import { W_HEIGHT, W_WIDTH } from "@/lib/constants";
import { useGameContext } from "@/contexts/game-context";

export const PlayedHand = () => {
  const { playedCards, turn } = useGameContext();

  const r = useRef<Konva.Layer>(null);
  const tweenRef = useRef<Konva.Tween>(null);
  const { width, height } = getPlayingCardSize();

  useEffect(() => {
    if (!r.current || !playedCards.length) return;

    const targetX = W_WIDTH / 2 - (width + (playedCards.length - 1) * width * 0.5) / 2;
    const targetY = W_HEIGHT / 2 - height / 2;

    let initX = 0;
    let initY = 0;
    switch (turn) {
      case "N":
        initX = targetX;
        initY = -height;
        break;
      case "E":
        initX = W_WIDTH;
        initY = targetY;
        break;
      case "S":
        initX = targetX;
        initY = W_HEIGHT;
        break;
      case "W":
        initX = -(width + (playedCards.length - 1) * width * 0.5);
        initY = targetY;
        break;
    }

    if (tweenRef.current) {
      tweenRef.current.destroy();
      tweenRef.current = null;
    }

    r.current.x(initX);
    r.current.y(initY);

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
  }, [playedCards]);

  if (!playedCards.length) return null;

  return (
    <Layer ref={r} height={height}>
      {playedCards.map((card, index) => (
        <KonvaPlayingCard key={index} card={card} index={index} />
      ))}
    </Layer>
  );
};
