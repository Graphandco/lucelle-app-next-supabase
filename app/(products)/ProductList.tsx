"use client";

import { useState, useTransition, useMemo } from "react";
import { getProductsClient } from "@/lib/supabase";
import { clearCartAction, deleteProductAction } from "@/app/actions";
import AddProduct from "./AddProduct";
import ProductItem from "./ProductItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Pencil, Store, ShoppingCart } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import Link from "next/link";

export type Product = {
  id: number;
  title: string;
  category_id: number;
  image_url?: string;
  image_label?: string;
  tobuy?: boolean;
  incart?: boolean;
  category?: {
    name: string;
  };
};

type Props = {
  initialProducts: Product[];
  pageType: "inventaire" | "shopping";
};

export default function ProductList({ initialProducts, pageType }: Props) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [query, setQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [isPending, startTransition] = useTransition();

  const filteredProducts = useMemo(() => {
    return products.filter((p) => p.title.toLowerCase().includes(query.toLowerCase()));
  }, [products, query]);

  const productsToBuy = useMemo(() => {
    return filteredProducts.filter((p) => p.tobuy && !p.incart);
  }, [filteredProducts]);

  const productsInCart = useMemo(() => {
    return filteredProducts.filter((p) => p.tobuy && p.incart);
  }, [filteredProducts]);

  const groupedByCategory = useMemo(() => {
    const map = new Map<string, Product[]>();

    for (const product of filteredProducts) {
      const categoryName = product.category?.name ?? "Sans catégorie";
      if (!map.has(categoryName)) map.set(categoryName, []);
      const list = map.get(categoryName)!;
      list.push(product);
      list.sort((a, b) => a.title.localeCompare(b.title));
    }

    return map;
  }, [filteredProducts]);

  const groupedToBuyByCategory = useMemo(() => {
    const map = new Map<string, Product[]>();

    for (const product of productsToBuy) {
      const categoryName = product.category?.name ?? "Sans catégorie";
      if (!map.has(categoryName)) map.set(categoryName, []);
      const list = map.get(categoryName)!;
      list.push(product);
      list.sort((a, b) => a.title.localeCompare(b.title));
    }

    return map;
  }, [productsToBuy]);

  const itemsToShow = pageType === "shopping" ? groupedToBuyByCategory : groupedByCategory;

  const handleConfirmDelete = () => {
    if (!selectedProduct) return;

    startTransition(async () => {
      const res = await deleteProductAction(selectedProduct.id);
      if (res.success) {
        setProducts(products.filter((p) => p.id !== selectedProduct.id));
        setSelectedProduct(null);
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Barre de contrôle */}
      <div className="flex items-center gap-2">
        <Input
          id="search"
          type="text"
          placeholder="Rechercher..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <AddProduct
          onAdd={async () => {
            const updated = await getProductsClient();
            setProducts(updated);
          }}
        />
        <Button
          className={editMode ? "text-green-600" : ""}
          variant="outline"
          onClick={() => setEditMode((prev) => !prev)}>
          {editMode ? <Check /> : <Pencil />}
        </Button>
        <Button variant="outline">
          <Link href={pageType === "shopping" ? "/inventaire" : "/shopping-list"}>
            {pageType === "shopping" ? <Store /> : <ShoppingCart />}
          </Link>
        </Button>
      </div>

      {/* Liste principale */}
      {filteredProducts.length === 0 ? (
        <p>Aucun produit trouvé.</p>
      ) : (
        <ul className="space-y-4">
          <AnimatePresence>
            {Array.from(itemsToShow.entries())
              .sort(([a], [b]) => a.localeCompare(b)) // 🔠 trie les catégories
              .map(([categoryName, group]) => (
                <div key={categoryName} className="space-y-2">
                  <h3 className="text-3xl text-primary font-anton mt-7 mb-4">{categoryName}</h3>
                  <ul className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                    <AnimatePresence>
                      {group.map((product) => (
                        <ProductItem
                          key={product.id}
                          product={product}
                          pageType={pageType}
                          editMode={editMode}
                          setProducts={setProducts}
                          isDeleting={isPending}
                          onDeleteRequest={setSelectedProduct}
                          onDeleteCancel={() => setSelectedProduct(null)}
                          onDeleteConfirm={handleConfirmDelete}
                        />
                      ))}
                    </AnimatePresence>
                  </ul>
                </div>
              ))}
          </AnimatePresence>
        </ul>
      )}

      {/* 🧺 Affichage du panier */}
      {pageType === "shopping" && productsInCart.length > 0 && (
        <div className="mt-10 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl text-muted-foreground font-anton">🧺 Dans le panier</h3>
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                const ids = productsInCart.map((p) => p.id);
                const res = await clearCartAction(ids);
                if (res.success) {
                  setProducts((prev) =>
                    prev.map((p) => (ids.includes(p.id) ? { ...p, tobuy: false, incart: false } : p)),
                  );
                }
              }}>
              Vider le panier
            </Button>
          </div>

          <ul className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {productsInCart
              .sort((a, b) => a.title.localeCompare(b.title)) // 🔠 Trie les produits dans le panier
              .map((product) => (
                <ProductItem
                  key={product.id}
                  product={product}
                  pageType={pageType}
                  editMode={editMode}
                  setProducts={setProducts}
                  isDeleting={isPending}
                  onDeleteRequest={setSelectedProduct}
                  onDeleteCancel={() => setSelectedProduct(null)}
                  onDeleteConfirm={handleConfirmDelete}
                />
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
