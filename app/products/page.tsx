import { createClient } from "@/utils/supabase/server";
import Inventaire from "./Inventaire";
import type { Product } from "@/app/products/Inventaire";
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
		category:categories!category_fk(name),
      image_url
      `,
    )
    .order("id")) as unknown as { data: Product[] };

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div>
      <h1 className="text-4xl font-anton text-primary">Inventaire</h1>
      <Inventaire initialProducts={products ?? []} />
    </div>
  );
}
