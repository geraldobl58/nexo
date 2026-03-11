import { MyPropertyById } from "@/features/owner/components/my-property-by-id";

type ImovelPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ImovelPage({ params }: ImovelPageProps) {
  const { id } = await params;
  return <MyPropertyById id={id} />;
}
