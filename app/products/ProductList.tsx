"use client";

import { useState, useTransition, useMemo } from "react";
import AddProduct from "./AddProduct";
import { getProductsClient } from "@/lib/supabase";
import { deleteProductAction } from "@/app/actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Pencil } from "lucide-react";

import { AnimatePresence, motion } from "framer-motion";
import ProductItem from "./ProductItem";

export type Product = {
  id: number;
  title: string;
  category_id: number;
  image_url?: string;
  image_label?: string;
  tobuy: boolean;
  incart: boolean;
  category?: {
    name: string;
  };
};

type Props = {
  products: Product[];
  pageType: "inventaire" | "shopping";
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
};

export default function ProductList({ products, setProducts, pageType }: Props) {
  const [query, setQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isPending, startTransition] = useTransition();
  const [editMode, setEditMode] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => p.title.toLowerCase().includes(query.toLowerCase()));
  }, [products, query]);

  const groupedByCategory = useMemo(() => {
    const map = new Map<string, Product[]>();

    for (const product of filteredProducts) {
      const categoryName = product.category?.name ?? "Sans catégorie";

      if (!map.has(categoryName)) {
        map.set(categoryName, []);
      }
      map.get(categoryName)!.push(product);
    }

    return map;
  }, [filteredProducts]);

  const handleConfirmDelete = () => {
    if (!selectedProduct) return;

    startTransition(async () => {
      const res = await deleteProductAction(selectedProduct.id);

      if (res.success) {
        setProducts(products.filter((p) => p.id !== selectedProduct.id));
        setSelectedProduct(null);
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <div className="grow">
          {/* <Label htmlFor="search">Rechercher un produit</Label> */}
          <Input
            id="search"
            type="text"
            placeholder="Rechercher..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <AddProduct
          onAdd={async () => {
            const updated = await getProductsClient();
            setProducts(updated);
          }}
        />
        <Button
          className={editMode ? "text-green-600" : ""}
          variant="outline"
          size="icon"
          onClick={() => setEditMode((prev) => !prev)}>
          {editMode ? <Check /> : <Pencil />}
        </Button>
      </div>

      {filteredProducts.length === 0 ? (
        <p>Aucun produit trouvé.</p>
      ) : (
        <ul className="space-y-4">
          <AnimatePresence>
            {Array.from(groupedByCategory.entries()).map(([categoryName, group]) => (
              <div key={categoryName} className="space-y-2">
                <h3 className="text-3xl text-primary font-anton mt-7 mb-4">{categoryName}</h3>
                <ul className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  <AnimatePresence>
                    {group.map((product) => (
                      <ProductItem
                        key={product.id}
                        product={product}
                        editMode={editMode}
                        isDeleting={isPending}
                        onDeleteRequest={setSelectedProduct}
                        onDeleteCancel={() => setSelectedProduct(null)}
                        onDeleteConfirm={handleConfirmDelete}
                        pageType={pageType}
                        setProducts={setProducts}
                      />
                    ))}
                  </AnimatePresence>
                </ul>
              </div>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
