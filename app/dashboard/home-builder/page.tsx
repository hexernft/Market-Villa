import { redirect } from "next/navigation";

export default function DisabledHomeBuilderPage() {
  redirect("/dashboard/store-details");
}
