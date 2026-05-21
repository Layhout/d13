import Avatar from "boring-avatars";
import { Badge } from "./retroui/Badge";
import { Card } from "./retroui/Card";

interface Props {
  avatarName: string;
  name: string;
  isPassed?: boolean;
  isOffline?: boolean;
  isTurn?: boolean;
  placed?: "1" | "2" | "3" | "4";
}

export const PlayerProfile = ({ name, avatarName, isPassed = false, isOffline = false, isTurn = false, placed = null }: Props) => {
  return (
    <Card className={`flex relative ${isTurn ? "bg-primary" : ""}`}>
      <Card.Content>
        <Avatar name={avatarName} className="border-2" variant="beam" square size={60} />
      </Card.Content>
      <Card.Header className="pl-0">
        <Card.Title className="font-black m-0 max-w-3xs text-ellipsis line-clamp-1">{name}</Card.Title>
        <Card.Description className="flex items-center gap-2">
          {isOffline && (
            <Badge size="sm" className="bg-destructive text-white">
              Offline
            </Badge>
          )}
          {placed && <Badge size="sm">{{ 1: "1st", 2: "2nd", 3: "3rd", 4: "4th" }[placed]}</Badge>}
          {isPassed && <Badge size="sm">Passed</Badge>}
        </Card.Description>
      </Card.Header>
    </Card>
  );
};
