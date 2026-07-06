import { redirect } from "next/navigation";

export default function AdminDomainRequestsRedirectPage() {
  redirect("/admin#domains");
}
