"use client";

import { useState } from "react";

import ProductList from "./ProductList";

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

export default function Inventaire({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-anton text-primary">Inventaire</h1>

      <ProductList products={products} setProducts={setProducts} pageType="inventaire" />
    </div>
  );
}
