import { Heading } from "@/components/ui/Heading/Heading";
import { ProtectedRoute } from "@/features/auth";
import { PublishProvider } from "@/features/owner/context/publish-context";
import { PublishWizardContent } from "@/features/owner/components/publish-wizard-content";

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
            <PublishWizardContent />
          </PublishProvider>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default PageOwner;
