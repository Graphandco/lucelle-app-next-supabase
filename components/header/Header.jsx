import Link from "next/link";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { createClient } from "@/utils/supabase/server";
import { LayoutDashboard, Menu, ShoppingBasket } from "lucide-react";
import MenuButton from "./MenuButton";

export default async function AuthButton() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ? (
    <div className="flex items-center gap-1">
      <MenuButton user={user} />
      <Button asChild size="sm" variant={"ghost"}>
        <Link href="/shopping-list">
          <ShoppingBasket />
        </Link>
      </Button>
      <Button asChild size="sm" variant={"ghost"}>
        <Link href="/dashboard">
          <LayoutDashboard />
        </Link>
      </Button>
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/sign-in">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
