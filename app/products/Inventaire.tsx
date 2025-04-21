"use client";

import { useState } from "react";
import AddProduct from "./AddProduct";
import { getProductsClient } from "@/lib/supabase";

import ProductList from "./ProductList";

export type Product = {
  id: number;
  title: string;
  category_id: number;
  image_url?: string;
  category?: {
    name: string;
  };
};

export default function Inventaire({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  return (
    <div className="space-y-8">
      {/* <AddProduct
        onAdd={async () => {
          const updated = await getProductsClient();
          setProducts(updated);
        }}
      /> */}
      <ProductList products={products} setProducts={setProducts} pageType="inventaire" />
    </div>
  );
}
