import { Image } from "react-konva";
import useImage from "use-image";

interface Props {
  img?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  shadowBlur?: number;
  shadowOffset?: { x: number; y: number };
}

export const KonvaCustomImg = ({ img, x, y, width, height, shadowBlur, shadowOffset }: Props) => {
  const [image] = useImage(img);
  return <Image image={image} x={x} y={y} width={width} height={height} shadowBlur={shadowBlur} shadowOffset={shadowOffset} />;
};
