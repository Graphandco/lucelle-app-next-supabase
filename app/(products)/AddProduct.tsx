"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { addProductAction, getCategoriesAction, listImagesFromBucket } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import Image from "next/image";
import { Check, Plus } from "lucide-react";

type Props = {
  onAdd: () => void;
};

export default function AddProduct({ onAdd }: Props) {
  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getCategoriesAction().then(setCategories);

    listImagesFromBucket().then((images) => {
      const filtered = images.filter((url) => {
        const filename = url.split("/").pop();
        return filename !== ".emptyFolderPlaceholder";
      });

      const sortedImages = filtered.sort((a, b) => {
        const nameA = a.split("/").pop() ?? "";
        const nameB = b.split("/").pop() ?? "";
        return nameA.localeCompare(nameB);
      });

      setExistingImages(sortedImages);
    });
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    setSelectedImageUrl(null);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const handleSelectImage = (url: string) => {
    setSelectedImageUrl(url);
    setImageFile(null);
    setImagePreview(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !selectedCategory) {
      toast.warning("Le titre et la catégorie sont requis.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("category_id", selectedCategory);

      if (imageFile) {
        formData.append("image", imageFile);
      } else if (selectedImageUrl) {
        formData.append("image_url", selectedImageUrl);
      }

      const res = await addProductAction(formData);

      if (res.success) {
        toast.success(res.message);
        setTitle("");
        setSelectedCategory("");
        setImageFile(null);
        setImagePreview(null);
        setSelectedImageUrl(null);
        onAdd();
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          //   size="icon"
        >
          <Plus />
        </Button>
      </DialogTrigger>

      <DialogContent className=" max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <div className="text-2xl text-primary">Ajouter un produit</div>
          </DialogTitle>
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
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="image">Téléverser une nouvelle image (optionnel)</Label>
            <Input id="image" type="file" accept="image/*" onChange={handleImageChange} />
          </div>

          <div>
            <Label>Ou choisir une image existante</Label>

            <div className="flex gap-x-2 gap-y-5 flex-wrap max-h-96 overflow-y-auto border p-2 rounded">
              {existingImages.map((url) => {
                const filename = url.split("/").pop(); // Extraire le nom du fichier
                return (
                  <button
                    key={url}
                    type="button"
                    onClick={() => handleSelectImage(url)}
                    className={`grow text-center flex flex-col justify-between ${selectedImageUrl === url ? "ring-2 ring-primary" : ""}`}>
                    <Image src={url} alt={filename ?? "Image"} width={30} height={30} className="mx-auto h-[30px]" />
                    <span className="block mt-1 text-xs text-muted-foreground truncate ">
                      {(filename ?? "")
                        .replace(/\.[^/.]+$/, "")
                        .replace(/[-_]/g, " ")
                        .replace(/^\w/, (c) => c.toUpperCase())}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {imagePreview && <img src={imagePreview} alt="Aperçu" className="mt-2 w-32 h-32 object-cover rounded" />}

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
