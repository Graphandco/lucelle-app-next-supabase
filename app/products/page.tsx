import { createClient } from "@/utils/supabase/server";
import EditProducts from "./EditProducts";
import type { Product } from "@/app/products/EditProducts"; // ou le chemin exact

export default async function Page() {
  const supabase = await createClient();

  const { data: products } = (await supabase
    .from("products")
    .select(
      `
		id,
		title,
		category_id,
		category:categories!category_fk(name),
      image_url
	`,
    )
    .order("id")) as unknown as { data: Product[] };

  return (
    <div>
      <EditProducts initialProducts={products ?? []} />
    </div>
  );
}
