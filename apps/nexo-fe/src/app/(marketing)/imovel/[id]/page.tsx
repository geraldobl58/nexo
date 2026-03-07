import { ListingDetail } from "@/features/owner/components/listing-detail";

type ImovelPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ImovelPage({ params }: ImovelPageProps) {
  const { id } = await params;
  return <ListingDetail id={id} />;
}
