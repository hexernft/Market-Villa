import { supabase } from "@/lib/supabase";

export async function uploadBusinessImage({
  file,
  businessId,
  folder = "products",
}: {
  file: File;
  businessId: string;
  folder?: "products" | "covers" | "logos" | "orders";
}) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please upload a valid image file.");
  }

  const fileExtension = file.name.split(".").pop() || "jpg";

  const safeFileName = `${crypto.randomUUID()}.${fileExtension}`;

  const filePath = `${businessId}/${folder}/${safeFileName}`;

  const { error } = await supabase.storage
    .from("business-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from("business-images")
    .getPublicUrl(filePath);

  return {
    path: filePath,
    publicUrl: data.publicUrl,
  };
}
