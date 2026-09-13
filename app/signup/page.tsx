import { redirect } from "next/navigation";

// Sign up terpisah sudah tidak dipakai — satu pintu login via Google
// (akun baru otomatis dibuat saat login pertama, lalu diarahkan ke /onboarding).
export default function SignupPage() {
  redirect("/login");
}
