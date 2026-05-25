import { useEffect, useState } from "react";
import { Text } from "./retroui/Text";

interface Props {
  onCountdownFinish: () => void;
}

export const CountdownWall = ({ onCountdownFinish }: Props) => {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown]);

  useEffect(() => {
    if (countdown === 0) {
      onCountdownFinish();
    }
  }, [countdown, onCountdownFinish]);

  return (
    <div className="absolute inset-0 text-white bg-black/50 flex flex-col justify-center items-center gap-4">
      <Text className="text-2xl font-mono">Game starting in...</Text>
      <Text as="h1" className="text-6xl font-black">
        {Math.max(countdown, 1)}
      </Text>
    </div>
  );
};
