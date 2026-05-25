import { onValue, ref, set, update as updateFirebase } from "firebase/database";
import { rdb } from "./firebase";

export const listen = <T>(path: string, callback: (data: T) => void): (() => void) => {
  const pathRef = ref(rdb, path);
  return onValue(pathRef, snapshot => {
    callback(snapshot.val());
  });
};

export const write = async (path: string, data: unknown) => {
  const pathRef = ref(rdb, path);
  await set(pathRef, data);
};

export const update = async (data: Record<string, unknown>) => {
  await updateFirebase(ref(rdb), data);
};
