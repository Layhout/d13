import { doc, type DocumentData, getDoc, setDoc, type WithFieldValue } from "firebase/firestore";
import { fdb } from "./firebase";

export const setData = async (collectionName: string, id: string, data: WithFieldValue<DocumentData>): Promise<void> => {
  const docRef = doc(fdb, collectionName, id);
  await setDoc(docRef, data, { merge: true });
};

export const getData = async <T>(collectionName: string, id: string): Promise<T | null> => {
  const docRef = doc(fdb, collectionName, id);
  const docSnap = await getDoc(docRef);

  return (docSnap.data() as T) || null;
};
