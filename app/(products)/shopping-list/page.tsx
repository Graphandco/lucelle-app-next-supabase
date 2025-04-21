import { createClient } from "@/utils/supabase/server";
import ProductList from "@/app/(products)/ProductList";
import type { Product } from "@/app/(products)/ProductList";
import { redirect } from "next/navigation";

export default async function Page() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: products } = (await supabase
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
    .order("id")) as unknown as { data: Product[] };

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div>
      <h1 className="font-anton text-5xl mb-8 text-center">Liste de courses</h1>

      <ProductList initialProducts={products ?? []} pageType="shopping" />
    </div>
  );
}
