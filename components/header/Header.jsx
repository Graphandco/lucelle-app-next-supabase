import Link from "next/link";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { createClient } from "@/utils/supabase/server";
import { LayoutDashboard, Menu, ShoppingBasket } from "lucide-react";
import MenuButton from "./MenuButton";
import { DropdownMenuDemo } from "./DropdownMenu";

export default async function AuthButton() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ? (
    <div className="flex items-center gap-3">
      <MenuButton user={user} />
      <Link href="/shopping-list">
        <ShoppingBasket />
      </Link>
      {/* <Button asChild size="sm" variant={"ghost"}>
      </Button> */}

      <DropdownMenuDemo />
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
