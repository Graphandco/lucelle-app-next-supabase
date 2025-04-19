import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import DashboardClient from "./DashBoardClient";

export default async function DashboardPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	// 🔁 Redirection si non connecté
	if (!user) {
		redirect("/sign-in");
	}

	const displayName = user.user_metadata?.display_name ?? "";
	const email = user.email ?? "";
	const createdAt = user.identities?.[0]?.created_at ?? "";

	return (
		<DashboardClient
			displayName={displayName}
			email={email}
			createdAt={createdAt}
		/>
	);
}
