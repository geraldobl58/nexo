import { ListingDetail } from "@/features/owner/components/listing-detail";

type ImovelPageProps = {
  params: {
    id: string;
  };
};

export default function ImovelPage({ params }: ImovelPageProps) {
  return <ListingDetail id={params.id} />;
}
