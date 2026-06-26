import { CustomStorePageRoute } from "@/components/CustomStorePageRoute";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default function StoreContactPage({ params }: PageProps) {
  return <CustomStorePageRoute params={params} page="contact" />;
}
