import { redirect } from "next/navigation";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

export default async function RootPage() {
  const supabase = await createClient();
  const user = await getCurrentUser();

  redirect(user ? "/beranda" : "/login");
}
