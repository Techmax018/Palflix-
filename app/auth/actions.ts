"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/auth/error?message=${encodeURIComponent(error.message)}`);
  }

  redirect("/feed");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const username = formData.get("username") as string;
  const displayName = formData.get("display_name") as string;
  const dateOfBirth = formData.get("date_of_birth") as string;

  // Age verification: must be 18+
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  if (age < 18) {
    redirect(
      `/auth/error?message=${encodeURIComponent("You must be 18 or older to create an account.")}`
    );
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo:
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
        `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/feed`,
      data: {
        username,
        display_name: displayName,
        date_of_birth: dateOfBirth,
      },
    },
  });

  if (error) {
    redirect(`/auth/error?message=${encodeURIComponent(error.message)}`);
  }

  redirect("/auth/sign-up-success");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
