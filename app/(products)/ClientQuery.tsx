"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export default function Page() {
	const [products, setProducts] = useState<any[] | null>(null);
	const supabase = createClient();

	useEffect(() => {
		const getData = async () => {
			const { data } = await supabase.from("products").select();
			setProducts(data);
		};
		getData();
	}, []);

	return <pre>{JSON.stringify(products, null, 2)}</pre>;
}
