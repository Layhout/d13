/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { Loader } from "./components/retroui/Loader";
import { useAuthState, useCreateUserWithEmailAndPassword, useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { Text } from "./components/retroui/Text";
import { PlayerProfile } from "./components/player-profile";
import type { Game, Player, Profile } from "@/lib/types";
import { Button } from "./components/retroui/Button";
import { Dialog } from "./components/retroui/Dialog";
import { cn, getClientId, getRandomAvatarName } from "@/lib/utils";
import { getData, setData } from "@/lib/firestore";
import { useAtom } from "jotai";
import { profileAtom } from "@/lib/atoms";
import Avatar from "boring-avatars";
import { Input } from "./components/retroui/Input";
import { AVATAR_NAMES } from "@/lib/constants";
import { GithubLogoIcon, PencilIcon } from "@phosphor-icons/react";
import { listen, write } from "@/lib/realtime";
import { Card } from "./components/retroui/Card";
import { Badge } from "./components/retroui/Badge";
import { useNavigate } from "react-router";

export default function App() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [openSetupProfileDialog, setOpenSetupProfileDialog] = useState(false);
  const [avatarName, setAvatarName] = useState(getRandomAvatarName());
  const [games, setGames] = useState<Game[]>([]);

  const [profile, setProfile] = useAtom(profileAtom);

  const [user, authLoading] = useAuthState(auth);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [login, _, __, loginError] = useSignInWithEmailAndPassword(auth);
  const [create] = useCreateUserWithEmailAndPassword(auth);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSaveProfile = async () => {
    if (!user?.uid) return;

    const payload: Profile = {
      id: user?.uid || "",
      name: inputRef.current.value || "",
      avatarName: avatarName,
    };
    if (!payload.name) {
      const clientId = await getClientId();
      payload.name = `anom${clientId.slice(0, 5)}`;
    }

    await setData("profiles", user?.uid || "", payload);
    setProfile(payload);
    setOpenSetupProfileDialog(false);
  };

  const addPlayerToRoom = async (roomId: number) => {
    const firstEmptySlot = games[roomId].players.findIndex(player => !player);
    if (firstEmptySlot === -1) return;

    await write(`game/${roomId}/players/${firstEmptySlot}`, profile);
    navigate(`/game/${roomId}`);
  };

  const loginProfile = useEffectEvent(async () => {
    const clientId = await getClientId();
    login(`anom${clientId.slice(0, 5)}@fm.com`, clientId);
    setLoading(false);
  });

  const createProfile = useEffectEvent(async () => {
    const clientId = await getClientId();
    create(`anom${clientId.slice(0, 5)}@fm.com`, clientId);
    setLoading(false);
  });

  const lookUpProfile = useEffectEvent(async () => {
    const foundProfile = await getData<Player>("profiles", user?.uid || "");
    setLoading(false);
    if (!foundProfile) {
      setOpenSetupProfileDialog(true);
    } else {
      setProfile(foundProfile);
    }
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) loginProfile();
    if (user && !profile) lookUpProfile();
    setLoading(false);
  }, [user, authLoading, profile]);

  useEffect(() => {
    if (loginError?.code) createProfile();
  }, [loginError?.code]);

  useEffect(() => {
    const unsub = listen<Game[]>("game", data => {
      setGames(data);
    });

    return () => unsub();
  }, []);

  if (loading)
    return (
      <div className="base-background flex justify-center items-center">
        <Loader size="lg" />
      </div>
    );

  return (
    <div className="base-background p-4">
      <div className="absolute top-0 inset-x-0 p-4 flex items-start">
        {profile && (
          <PlayerProfile
            name={profile.name}
            avatarName={profile.avatarName}
            descriptionComp={
              <Button
                size="icon"
                onClick={() => {
                  setAvatarName(profile.avatarName as (typeof AVATAR_NAMES)[number]);
                  setOpenSetupProfileDialog(true);
                }}
              >
                <PencilIcon weight="fill" />
              </Button>
            }
          />
        )}
        <Button className="ml-auto" size="sm" variant="secondary" render={<a target="_blank" href="https://github.com/Layhout/d13" />}>
          <GithubLogoIcon weight="fill" className="size-4 mr-2" />
          Repo
        </Button>
      </div>
      <div className="relative">
        <Text as="h1" className="font-black text-white mt-56 mb-24 text-center">
          D13
        </Text>
        <div className="flex flex-col items-center gap-4">
          <Dialog>
            <Dialog.Trigger render={<Button size="lg">Play game</Button>} nativeButton={true} />
            <Dialog.Content size="2xl">
              <Dialog.Header>
                <Text as="h5" className="font-black">
                  Select a room
                </Text>
              </Dialog.Header>
              <div className="grid grid-cols-3 gap-4 p-4">
                {games.map((game, index) => (
                  <Card key={index}>
                    <Card.Header className="pb-0 flex-row gap-2 justify-between">
                      <Card.Title className="font-black">Room {index + 1}</Card.Title>
                      {game.started ? (
                        <Badge className="bg-red-600 text-white" size="sm">
                          In Progress...
                        </Badge>
                      ) : (
                        <Badge className="bg-green-600 text-white" size="sm">
                          Waiting...
                        </Badge>
                      )}
                    </Card.Header>
                    <Card.Content className="pt-0">
                      <ul className="mb-2">
                        {game?.players &&
                          game.players.map((player, index) => (
                            <li key={index}>
                              {index + 1}. {player ? player.name : "Empty Slot"}
                            </li>
                          ))}
                      </ul>
                      <div className="flex justify-end mt-2">
                        <Button onClick={() => addPlayerToRoom(index)}>Enter</Button>
                      </div>
                    </Card.Content>
                  </Card>
                ))}
              </div>
            </Dialog.Content>
          </Dialog>
          <Button size="sm" variant="secondary" render={<a href="https://www.wikihow.com/Play-Tien-Len" target="_blank" />}>
            How to play?
          </Button>
          <Dialog>
            <Dialog.Trigger
              render={
                <Button size="sm" variant="secondary">
                  Disclaimer
                </Button>
              }
              nativeButton={true}
            />
            <Dialog.Content>
              <Dialog.Header>
                <Text as="h5" className="font-black">
                  Disclaimer
                </Text>
              </Dialog.Header>
              <div className="p-4">
                This project was developed solely for educational and learning purposes. It is intended to demonstrate technical concepts, experimentation, and skill development. The project is not
                intended for commercial use, production deployment, or malicious activity. Any resemblance to real systems, applications, or services is purely coincidental.
              </div>
            </Dialog.Content>
          </Dialog>
        </div>
      </div>
      <Dialog open={openSetupProfileDialog}>
        <Dialog.Content>
          <Dialog.Header closable={false}>
            <Text as="h5" className="font-black">
              Setup profile
            </Text>
          </Dialog.Header>
          <div className="flex flex-col">
            <div className="flex gap-4 p-4 pb-0">
              <Avatar name={avatarName} className="border-2 shrink-0" variant="beam" square size={60} />
              <Input ref={inputRef} placeholder="Enter a nickname" defaultValue={profile?.name} />
            </div>
            <Text as="h6" className="mt-6 pl-4">
              Select an avatar
            </Text>
            <div className="grid grid-cols-7 gap-4 max-h-[calc(100vh-50rem)] overflow-y-auto p-4 pt-2">
              {AVATAR_NAMES.map((option, index) => (
                <Avatar
                  key={index}
                  name={option}
                  className={cn("border-2 shrink-0 cursor-pointer", avatarName === option ? "ring-black ring-4" : "")}
                  variant="beam"
                  square
                  size={60}
                  onClick={() => setAvatarName(option)}
                />
              ))}
            </div>
          </div>
          <Dialog.Footer>
            <Button onClick={handleSaveProfile}>Save</Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </div>
  );
}
