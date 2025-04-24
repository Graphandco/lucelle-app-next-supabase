"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Product } from "./ProductList";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Trash2, ShoppingCart } from "lucide-react";
import { toggleInCartAction, toggleTobuyAction } from "@/app/actions";
import { Badge } from "@/components/ui/badge";

type Props = {
  product: Product;
  editMode: boolean;
  onDeleteRequest: (product: Product) => void;
  onDeleteCancel: () => void;
  onDeleteConfirm: () => void;
  isDeleting: boolean;
  pageType: "inventaire" | "shopping";
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
};

export default function ProductItem({
  product,
  editMode,
  onDeleteRequest,
  onDeleteCancel,
  onDeleteConfirm,
  isDeleting,
  pageType,
  setProducts,
}: Props) {
  const handleClick = async () => {
    if (editMode) return;

    const updatedProduct = { ...product };

    if (pageType === "inventaire") {
      const res = await toggleTobuyAction(product.id, product.tobuy ?? false);
      if (res.success) {
        updatedProduct.tobuy = !product.tobuy;
      }
    } else {
      const res = await toggleInCartAction(product.id, product.incart ?? false);
      if (res.success) {
        updatedProduct.incart = !product.incart;
      }
    }

    // ✅ Met à jour le produit dans la liste
    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, ...updatedProduct } : p)));
  };

  return (
    <motion.li
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      onClick={handleClick}
      className={`relative flex flex-col items-center text-center py-3 px-2 bg-card rounded-xl cursor-pointer hover:bg-neutral-800 transition-colors ${pageType === "inventaire" && product.tobuy && "border border-primary"}`}>
      <div className="flex flex-col items-center gap-2">
        {pageType === "inventaire" && product.tobuy && (
          <Badge className="absolute -top-2 -right-2">
            <ShoppingCart size={20} />
          </Badge>
        )}
        {product.image_url && (
          <Image
            src={product.image_url}
            alt={product.image_label ?? product.title ?? "Image"}
            width={50}
            height={50}
            sizes="(max-width: 640px) 100vw, 320px"
            style={{ height: "50px", objectFit: "contain" }}
          />
        )}
        <span className="text-neutral-300 text-sm">{product.title}</span>
        {/* <div className="text-xs text-neutral-400">
          <div>{product.tobuy ? "🛒 À acheter" : "✅ Dans l'inventaire"}</div>
          <div>{product.incart ? "🧺 Dans le panier" : "⛔️ Pas encore au panier"}</div>
        </div> */}
      </div>

      {editMode && (
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDeleteRequest(product)}
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
              <Button variant="ghost" onClick={onDeleteCancel}>
                Annuler
              </Button>
              <Button variant="destructive" onClick={onDeleteConfirm} disabled={isDeleting}>
                {isDeleting ? "Suppression..." : "Confirmer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </motion.li>
  );
}
