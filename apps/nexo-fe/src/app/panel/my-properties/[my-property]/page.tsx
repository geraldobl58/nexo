import { MyProperty } from "@/features/owner/components/my-property";

type MyPropertyProps = {
  params: Promise<{
    "my-property": string;
  }>;
};

const MyPropertyPage = async ({ params }: MyPropertyProps) => {
  const resolvedParams = await params;
  return (
    <div>
      <div>
        <MyProperty params={resolvedParams} />
      </div>
    </div>
  );
};

export default MyPropertyPage;
