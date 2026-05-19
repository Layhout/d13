import { type ComponentProps } from "react";
import { Image } from "react-konva";
import useImage from "use-image";

export const KonvaImage = ({ src, ...props }: { src: string } & ComponentProps<typeof Image>) => {
  const [image] = useImage(src);
  return <Image {...props} image={image} />;
};
