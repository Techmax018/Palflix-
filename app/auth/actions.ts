"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function login(formData: FormData) {
  try {
    const supabase = await createClient();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Validate inputs
    if (!email || !password) {
      return { success: false, error: "Email and password are required" };
    }

    if (!email.includes("@")) {
      return { success: false, error: "Please enter a valid email address" };
    }

    const { data, error } = await supabase.auth.signInWithPassword({ 
      email: email.trim().toLowerCase(), 
      password 
    });

    if (error) {
      // Provide user-friendly error messages
      if (error.message.includes("Invalid login credentials")) {
        return { success: false, error: "Invalid email or password" };
      }
      if (error.message.includes("Email not confirmed")) {
        return { success: false, error: "Please verify your email address before signing in" };
      }
      if (error.message.includes("User not found")) {
        return { success: false, error: "No account found with this email" };
      }
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: "Authentication failed. Please try again" };
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "An unexpected error occurred. Please try again" };
  }
}

export async function signup(formData: FormData) {
  try {
    const supabase = await createClient();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const username = formData.get("username") as string;
    const displayName = formData.get("display_name") as string;
    const dateOfBirth = formData.get("date_of_birth") as string;

    // Validate inputs
    if (!email || !password || !username || !displayName || !dateOfBirth) {
      return { success: false, error: "All fields are required" };
    }

    if (!email.includes("@")) {
      return { success: false, error: "Please enter a valid email address" };
    }

    if (password.length < 8) {
      return { success: false, error: "Password must be at least 8 characters long" };
    }

    if (username.length < 3) {
      return { success: false, error: "Username must be at least 3 characters long" };
    }

    // Validate username format (alphanumeric and underscores only)
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return { success: false, error: "Username can only contain letters, numbers, and underscores" };
    }

    // Age verification: must be 18+
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    if (age < 18) {
      return { success: false, error: "You must be 18 or older to create an account" };
    }

    if (isNaN(dob.getTime())) {
      return { success: false, error: "Please enter a valid date of birth" };
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/feed`,
        data: {
          username: username.trim().toLowerCase(),
          display_name: displayName.trim(),
          date_of_birth: dateOfBirth,
          age_verified: true,
        },
      },
    });

    if (error) {
      // Provide user-friendly error messages
      if (error.message.includes("User already registered")) {
        return { success: false, error: "An account with this email already exists" };
      }
      if (error.message.includes("Password should be at least")) {
        return { success: false, error: "Password is too weak. Please use a stronger password" };
      }
      if (error.message.includes("Unable to validate email")) {
        return { success: false, error: "Invalid email address format" };
      }
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: "Account creation failed. Please try again" };
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Signup error:", error);
    return { success: false, error: "An unexpected error occurred. Please try again" };
  }
}

export async function logout() {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return { success: false, error: "Failed to sign out. Please try again" };
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    return { success: false, error: "An unexpected error occurred during sign out" };
  }
}
