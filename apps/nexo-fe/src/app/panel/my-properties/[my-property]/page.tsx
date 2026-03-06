import { MyProperty } from "@/features/owner/components/my-property";

type MyPropertyProps = {
  params: {
    "my-property": string;
  };
};

const MyPropertyPage = ({ params }: MyPropertyProps) => {
  return (
    <div>
      <div>
        <MyProperty params={params} />
      </div>
    </div>
  );
};

export default MyPropertyPage;
