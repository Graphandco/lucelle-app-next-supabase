"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { addProductAction, getCategoriesAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

type Props = {
  onAdd: () => void;
};

export default function AddProduct({ onAdd }: Props) {
  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getCategoriesAction().then(setCategories);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !selectedCategory || !imageFile) {
      toast.warning("Le titre, la catégorie et l’image sont requis.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("category_id", selectedCategory);
      formData.append("image", imageFile); // ajout du fichier

      const res = await addProductAction(formData);

      if (res.success) {
        toast.success(res.message);
        setTitle("");
        setSelectedCategory("");
        setImageFile(null);
        setImagePreview(null);
        onAdd();
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="mb-4">Ajouter un produit</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un produit</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
          <div>
            <Label htmlFor="title">Nom du produit</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nom du produit" />
          </div>

          <div>
            <Label>Catégorie</Label>
            <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="image">Image du produit</Label>
            <Input id="image" type="file" accept="image/*" onChange={handleImageChange} />
            {imagePreview && <img src={imagePreview} alt="Aperçu" className="mt-2 w-32 h-32 object-cover rounded" />}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Ajout..." : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
