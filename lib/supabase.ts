import { createBrowserClient } from "@supabase/ssr";

export const getProductsClient = async () => {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  ); // ou ton utilitaire client
  const { data, error } = await supabase
    .from("products")
    .select(
      `
			id,
			title,
			category_id,
			category:categories!category_fk(name)
		`,
    )
    .order("id");

  if (error) {
    console.error("Erreur client Supabase :", error.message);
    return [];
  }

  return data ?? [];
};
