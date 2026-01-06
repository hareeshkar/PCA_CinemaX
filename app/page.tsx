import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // User is logged in, redirect to dashboard
    redirect("/admin/dashboard");
  } else {
    // User is not logged in, redirect to login
    redirect("/login");
  }
}
