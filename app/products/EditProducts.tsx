"use client";

import { useState, useTransition, useMemo } from "react";
import AddProduct from "./AddProduct";
import { getProductsClient } from "@/lib/supabase";
import { deleteProductAction } from "@/app/actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AnimatePresence, motion } from "framer-motion";

export type Product = {
  id: number;
  title: string;
  category_id: number;
  image_url?: string;
  category?: {
    name: string;
  };
};

export default function ProductListClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [query, setQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [isPending, startTransition] = useTransition();

  const handleConfirmDelete = () => {
    if (!selectedProduct) return;

    startTransition(async () => {
      const res = await deleteProductAction(selectedProduct.id);

      if (res.success) {
        setProducts((prev) => prev.filter((p) => p.id !== selectedProduct.id));
        setSelectedProduct(null);
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  };

  // Filtrage live

  const filteredProducts = useMemo(() => {
    return products.filter((p) => p.title.toLowerCase().includes(query.toLowerCase()));
  }, [products, query]);

  // Filtrage par catégorie
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

  return (
    <div className="space-y-8">
      {/* Ajout de produit */}
      <AddProduct
        onAdd={async () => {
          const updated = await getProductsClient();
          setProducts(
            updated.map((product) => ({
              ...product,
              category: Array.isArray(product.category) ? product.category[0] : product.category,
            })),
          );
        }}
      />

      {/* Recherche */}
      <div className="space-y-2">
        <Label htmlFor="search">Rechercher un produit</Label>
        <Input
          id="search"
          type="text"
          placeholder="Rechercher par titre..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Liste */}
      {filteredProducts.length === 0 ? (
        <p>Aucun produit trouvé.</p>
      ) : (
        <ul className="space-y-4">
          <AnimatePresence>
            {Array.from(groupedByCategory.entries()).map(([categoryName, group]) => (
              <div key={categoryName} className="space-y-2">
                <h3 className="text-lg font-semibold">{categoryName}</h3>
                <ul className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  <AnimatePresence>
                    {group.map((product) => (
                      <motion.li
                        key={product.id}
                        initial={{
                          opacity: 0,
                          scale: 0.95,
                        }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                        }}
                        exit={{
                          opacity: 0,
                          scale: 0.95,
                        }}
                        transition={{
                          duration: 0.2,
                        }}
                        className="flex flex-col items-center text-center border p-4 rounded">
                        <div className="flex flex-col">
                          {product.image_url && (
                            <img src={product.image_url} alt={product.title} className="w-16 h-16 " />
                          )}
                          <span className="font-medium">{product.title}</span>
                        </div>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedProduct(product)}
                              className="text-red-600 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                              <span className="sr-only">Supprimer {product.title}</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Supprimer ce produit ?</DialogTitle>
                              <DialogDescription>
                                Le produit <strong>{product.title}</strong> sera supprimé définitivement.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button variant="ghost" onClick={() => setSelectedProduct(null)}>
                                Annuler
                              </Button>
                              <Button variant="destructive" onClick={handleConfirmDelete} disabled={isPending}>
                                {isPending ? "Suppression..." : "Confirmer"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </motion.li>
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
