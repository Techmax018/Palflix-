"use client";

import { signIn, signUp, logOut } from "@/lib/firebase/auth";

export async function login(email: string, password: string) {
  try {
    if (!email || !password) return { success: false, error: "Email and password are required" };
    if (!email.includes("@")) return { success: false, error: "Please enter a valid email address" };

    await signIn(email.trim().toLowerCase(), password);
    return { success: true };
  } catch (err: any) {
    const code = err?.code ?? "";
    if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
      return { success: false, error: "Invalid email or password" };
    }
    if (code === "auth/too-many-requests") {
      return { success: false, error: "Too many attempts. Please try again later" };
    }
    return { success: false, error: err?.message ?? "An unexpected error occurred" };
  }
}

export async function signup(
  email: string,
  password: string,
  username: string,
  displayName: string,
  dateOfBirth: string
) {
  try {
    if (!email || !password || !username || !displayName || !dateOfBirth) {
      return { success: false, error: "All fields are required" };
    }
    if (!email.includes("@")) return { success: false, error: "Please enter a valid email address" };
    if (password.length < 8) return { success: false, error: "Password must be at least 8 characters" };
    if (username.length < 3) return { success: false, error: "Username must be at least 3 characters" };
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return { success: false, error: "Username can only contain letters, numbers, and underscores" };
    }

    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime())) return { success: false, error: "Please enter a valid date of birth" };

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    if (age < 18) return { success: false, error: "You must be 18 or older to create an account" };

    await signUp(email.trim().toLowerCase(), password, displayName.trim());
    return { success: true };
  } catch (err: any) {
    const code = err?.code ?? "";
    if (code === "auth/email-already-in-use") {
      return { success: false, error: "An account with this email already exists" };
    }
    if (code === "auth/weak-password") {
      return { success: false, error: "Password is too weak. Please use a stronger password" };
    }
    return { success: false, error: err?.message ?? "An unexpected error occurred" };
  }
}

export async function logout() {
  try {
    await logOut();
    return { success: true };
  } catch (err: any) {
    return { success: false, error: "Failed to sign out. Please try again" };
  }
}
