import { useEffect, useRef } from "react";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

export default function App() {
  const playerIdRef = useRef<string | null>(null);

  useEffect(() => {
    (async () => {
      const fp = await FingerprintJS.load();
      const result = await fp.get();

      playerIdRef.current = result.visitorId;
    })();
  }, []);

  return <div className="base-background"></div>;
}
