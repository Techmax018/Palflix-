import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  type User,
} from "firebase/auth";
import { auth } from "./client";

const googleProvider = new GoogleAuthProvider();

function setSessionCookie(value: string) {
  document.cookie = `fb_session=${value}; path=/; max-age=86400; SameSite=Lax`;
}

function clearSessionCookie() {
  document.cookie = "fb_session=; path=/; max-age=0";
}

export async function signUp(email: string, password: string, displayName: string) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  const token = await credential.user.getIdToken();
  setSessionCookie(token);
  return credential.user;
}

export async function signIn(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const token = await credential.user.getIdToken();
  setSessionCookie(token);
  return credential.user;
}

export async function logOut() {
  clearSessionCookie();
  await signOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

export async function signInWithGoogle() {
  const credential = await signInWithPopup(auth, googleProvider);
  const token = await credential.user.getIdToken();
  setSessionCookie(token);
  return credential.user;
}
