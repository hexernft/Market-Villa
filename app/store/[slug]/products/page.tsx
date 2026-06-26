import { CustomStorePageRoute } from "@/components/CustomStorePageRoute";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default function StoreProductsPage({ params }: PageProps) {
  return <CustomStorePageRoute params={params} page="products" />;
}
