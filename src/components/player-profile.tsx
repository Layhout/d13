import Avatar from "boring-avatars";
import { Badge } from "./retroui/Badge";
import { Card } from "./retroui/Card";
import type { Player } from "@/lib/types";

export const PlayerProfile = ({ name, avatarName, isPass = false, isTurn = false, isReady = false, place = null, descriptionComp }: Player & { descriptionComp?: React.ReactNode }) => {
  return (
    <Card className={`flex relative ${isTurn ? "bg-primary" : ""}`}>
      <Card.Content>
        <Avatar name={avatarName} className="border-2" variant="beam" square size={60} />
      </Card.Content>
      <Card.Header className="pl-0">
        <Card.Title className="font-black m-0 max-w-3xs text-ellipsis line-clamp-1">{name}</Card.Title>
        <Card.Description className="flex items-center gap-2">
          {isReady && (
            <Badge size="sm" className="bg-green-600 text-white hover:bg-green-600/90">
              Ready
            </Badge>
          )}
          {place && <Badge size="sm">{{ 1: "1st", 2: "2nd", 3: "3rd", 4: "4th" }[place]}</Badge>}
          {isPass && <Badge size="sm">Passed</Badge>}
          {descriptionComp}
        </Card.Description>
      </Card.Header>
    </Card>
  );
};
