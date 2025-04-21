"use client";

import { useState, useTransition, useMemo } from "react";
import AddProduct from "./AddProduct";
import { getProductsClient } from "@/lib/supabase";
import { deleteProductAction } from "@/app/actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Divide, Pencil, Trash2 } from "lucide-react";
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
import Image from "next/image";

export type Product = {
  id: number;
  title: string;
  category_id: number;
  image_url?: string;
  image_label?: string; // 👈 ajouter ici
  category?: {
    name: string;
  };
};

type Props = {
  products: Product[];
  pageType: "inventaire" | "shopping";
  setProducts: (products: Product[]) => void;
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
                      <motion.li
                        key={product.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col items-center text-center py-3 px-2 bg-neutral-900 rounded-xl ">
                        <div className="flex flex-col items-center gap-1">
                          {product.image_url && (
                            <>
                              <Image
                                src={product.image_url}
                                alt={product.image_label ?? product.title ?? "Image"}
                                width={50}
                                height={50}
                                sizes="(max-width: 640px) 100vw, 320px"
                              />
                              {/* <span className="text-xs mt-1 truncate max-w-[90px]">
                                {product.image_label ?? product.image_url?.split("/").pop()}
                              </span> */}
                            </>
                          )}
                          <span className="text-neutral-300 text-sm">{product.title}</span>
                        </div>

                        {editMode && (
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
                        )}
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
