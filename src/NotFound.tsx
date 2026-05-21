import { NOT_FOUND_MSG } from "@/lib/constants";
import { randomNumBetween } from "@/lib/utils";
import { Button } from "./components/retroui/Button";
import { HouseIcon } from "@phosphor-icons/react";
import { Link } from "react-router";
import { Text } from "./components/retroui/Text";

export default function NotFound() {
  return (
    <div className="min-h-screen min-w-screen flex flex-col justify-center items-center">
      <Text as="h1" className="font-black text-center">
        404
      </Text>
      <p className="text-center mt-4 mb-10">{NOT_FOUND_MSG[randomNumBetween(0, NOT_FOUND_MSG.length - 1)]}</p>
      <Button render={<Link to="/" />}>
        <HouseIcon className="h-4 w-4 mr-2" weight="fill" /> Go to Home
      </Button>
    </div>
  );
}
