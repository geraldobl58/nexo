import { Heading } from "@/components/ui/heading/heading";
import { PublishProvider } from "@/contexts/publish-context";

import { ProtectedRoute } from "@/features/auth";
import { MyPropertyPublishWizard } from "@/features/owner/components/my-property-publish-wizard";

const PageOwner = () => {
  return (
    <ProtectedRoute>
      <div className="bg-primary/5">
        <div className="flex flex-col gap-4 px-4 py-12 space-y-4 max-w-7xl mx-auto">
          <Heading
            align="center"
            title="Faça seu cadastro em poucos passos"
            description="Preencha as informações do seu imóvel para criar o anúncio e começar a receber propostas de interessados."
          />
          <PublishProvider>
            <MyPropertyPublishWizard />
          </PublishProvider>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default PageOwner;
