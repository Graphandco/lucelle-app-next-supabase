"use client";

import Image from "next/image";

export default function TestImage() {
  const url =
    "https://lrgragafrtdmqoevxhga.supabase.co/storage/v1/object/public/product-images/products/01570a07-2a0d-4f32-bfea-e91920ec8dca.png";

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-xl font-bold">Test affichage image</h1>
      <Image src={url} alt="Test" width={200} height={200} className="rounded border" />
    </div>
  );
}
