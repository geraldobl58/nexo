import { Suspense } from "react";
import { CircularProgress } from "@mui/material";
import { MyProperties } from "@/features/owner/components/my-properties";

const MyPropertiesPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <CircularProgress />
        </div>
      }
    >
      <MyProperties />
    </Suspense>
  );
};

export default MyPropertiesPage;
