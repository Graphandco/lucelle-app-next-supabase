import MenuButton from "./MenuButton";
import { createClient } from "@/utils/supabase/server";

const Header = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header>
      <div>
        <MenuButton user={user} />
      </div>
    </header>
  );
};

export default Header;
