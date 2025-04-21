import { createBrowserClient } from "@supabase/ssr";

export type Product = {
  id: number;
  title: string;
  category_id: number;
  image_url?: string;
  tobuy: boolean;
  incart: boolean;
  category?: {
    name: string;
  };
};

export const getProductsClient = async (): Promise<Product[]> => {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data, error } = await supabase
    .from("products")
    .select(
      `
    id,
    title,
    category_id,
    image_url,
    tobuy,
    incart,
    category:categories!category_fk(name)
  `,
    )
    .order("id");

  if (error) {
    console.error("Erreur client Supabase :", error.message);
    return [];
  }

  return (data ?? []).map((product) => ({
    ...product,
    category: Array.isArray(product.category) ? product.category[0] : product.category,
  }));
};
