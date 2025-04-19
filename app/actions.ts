"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  if (!email || !password) {
    return encodedRedirect("error", "/sign-up", "Email and password are required");
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  } else {
    return encodedRedirect(
      "success",
      "/sign-up",
      "Thanks for signing up! Please check your email for a verification link.",
    );
  }
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/protected");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect("error", "/forgot-password", "Could not reset password");
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect("success", "/forgot-password", "Check your email for a link to reset your password.");
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect("error", "/protected/reset-password", "Password and confirm password are required");
  }

  if (password !== confirmPassword) {
    encodedRedirect("error", "/protected/reset-password", "Passwords do not match");
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect("error", "/protected/reset-password", "Password update failed");
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

export async function getUserInfosAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    displayName: user?.user_metadata?.display_name ?? "",
    email: user?.email ?? "",
  };
}

export async function updateUserProfileAction(displayName: string, email: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    data: { display_name: displayName },
    email: email,
  });

  if (error) {
    return { success: false, message: error.message };
  }
  return { success: true, message: "Profil mis à jour avec succès !" };
}
export async function addProductAction(formData: FormData) {
  const title = formData.get("title")?.toString();
  const category_id_raw = formData.get("category_id")?.toString();
  const file = formData.get("image") as File | null;

  const category_id = category_id_raw ? parseInt(category_id_raw, 10) : null;

  if (!title || !category_id || !file) {
    return { success: false, message: "Titre, image et catégorie requis." };
  }

  const supabase = await createClient();

  // Générer un nom de fichier unique
  const fileExt = file.name.split(".").pop();
  const fileName = `${randomUUID()}.${fileExt}`;
  const filePath = `products/${fileName}`;

  // 1. Upload dans le bucket
  const { error: uploadError } = await supabase.storage.from("product-images").upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (uploadError) {
    console.error("Erreur upload image :", uploadError.message);
    return { success: false, message: "Erreur lors de l'envoi de l'image." };
  }

  // 2. Récupérer l’URL publique
  const {
    data: { publicUrl },
  } = supabase.storage.from("product-images").getPublicUrl(filePath);

  // 3. Insérer le produit dans la base
  const { error } = await supabase.from("products").insert({
    title,
    category_id,
    image_url: publicUrl,
  });

  if (error) {
    console.error("Erreur ajout produit :", error.message);
    return { success: false, message: error.message };
  }

  return { success: true, message: "Produit ajouté avec succès." };
}

export async function getProductsAction() {
  const supabase = await createClient();

  const { data, error } = await supabase.from("products_with_category").select("*").order("id");

  if (error) {
    console.error("Erreur lors de la récupération des produits :", error.message);
    return [];
  }

  return data ?? [];
}

export async function deleteProductAction(productId: number) {
  if (!productId) {
    return { success: false, message: "ID du produit manquant." };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("products").delete().eq("id", productId);

  if (error) {
    console.error("Erreur lors de la suppression :", error.message);
    return { success: false, message: error.message };
  }

  return { success: true, message: "Produit supprimé avec succès." };
}
export async function getCategoriesAction() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("*").order("name", { ascending: true });

  if (error) {
    console.error("Erreur lors de la récupération des catégories :", error.message);
    return [];
  }

  return data ?? [];
}
