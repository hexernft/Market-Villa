import { redirect } from "next/navigation";

export default function DashboardThemeRedirectPage() {
  redirect("/dashboard/theme-store");
}