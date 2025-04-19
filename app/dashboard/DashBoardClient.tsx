"use client";

import { useState, useTransition } from "react";
import { updateUserProfileAction, signOutAction } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Props = {
	displayName: string;
	email: string;
	createdAt: string;
};

const DashboardClient = ({ displayName, email, createdAt }: Props) => {
	const [initialName, setInitialName] = useState(displayName);
	const [initialEmail, setInitialEmail] = useState(email);
	const [name, setName] = useState("");
	const [emailInput, setEmailInput] = useState("");
	const [isPending, startTransition] = useTransition();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		startTransition(async () => {
			const res = await updateUserProfileAction(
				name || initialName,
				emailInput || initialEmail
			);

			if (res.success) {
				toast.success("Profil mis à jour !");
				setInitialName(name || initialName);
				setInitialEmail(emailInput || initialEmail);
				setName("");
				setEmailInput("");
			} else {
				toast.error("Erreur : " + res.message);
			}
		});
	};

	return (
		<div className="max-w-xl mx-auto p-6">
			<div className="flex justify-between items-center gap-10 mb-6">
				<h1 className="text-4xl font-bold">Tableau de bord</h1>
				<form action={signOutAction}>
					<Button type="submit" variant={"destructive"} className="">
						Se déconnecter
					</Button>
				</form>
			</div>

			<p className="text-gray-400 mb-4">
				Bienvenue{" "}
				<span className="text-white font-semibold">{displayName}</span>{" "}
				! Mettez à jour vos informations de profil ci-dessous.
			</p>

			<p className="text-gray-400 mb-4">
				Compte créé le{" "}
				{new Date(createdAt).toLocaleDateString("fr-FR", {
					day: "numeric",
					month: "long",
					year: "numeric",
				})}{" "}
			</p>

			<form onSubmit={handleSubmit} className="space-y-6">
				<div className="grid gap-2">
					<Label htmlFor="displayName">Nom affiché</Label>
					<Input
						id="displayName"
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder={initialName}
					/>
				</div>

				<div className="grid gap-2">
					<Label htmlFor="email">Adresse email</Label>
					<Input
						id="email"
						type="email"
						value={emailInput}
						onChange={(e) => setEmailInput(e.target.value)}
						placeholder={initialEmail}
					/>
				</div>

				<Button type="submit" disabled={isPending}>
					{isPending ? "Mise à jour..." : "Mettre à jour"}
				</Button>
			</form>
		</div>
	);
};

export default DashboardClient;
