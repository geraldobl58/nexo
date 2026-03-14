import { SingleProperty } from "@/features/marketing/components/single-property.component";

type SinglePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function SinglePage({ params }: SinglePageProps) {
  const { slug } = await params;
  return <SingleProperty slug={slug} />;
}
