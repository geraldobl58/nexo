"use client";

import { Heading } from "@/components/ui/Heading/Heading";
import { StepperWizard } from "@/components/ui/StepperWizard/StepperWizard";
import { StepLocation } from "../../../../features/owner/components/step-location";
import { ProtectedRoute } from "@/features/auth";
import {
  PublishProvider,
  PUBLISH_STEPS,
  usePublish,
} from "../../../../features/owner/context/publish-context";
import { StepDetails } from "@/features/owner/components/step-details";
import { StepComodities } from "@/features/owner/components/step-comodities";
import { StepFinished } from "@/features/owner/components/step-finished";

// ---------------------------------------------------------------------------
// Conteúdo interno (precisa estar dentro do Provider para usar usePublish)
// ---------------------------------------------------------------------------

function PublishWizardContent() {
  const { activeStep, goNext, goBack, isNextDisabled } = usePublish();

  return (
    <StepperWizard
      steps={[...PUBLISH_STEPS]}
      activeStep={activeStep}
      onNext={goNext}
      onBack={goBack}
      nextDisabled={isNextDisabled()}
    >
      {PUBLISH_STEPS[activeStep] === "Localização do imóvel" && (
        <StepLocation />
      )}
      {PUBLISH_STEPS[activeStep] === "Detalhes do imóvel" && <StepDetails />}
      {PUBLISH_STEPS[activeStep] === "Fotos do imóvel" && (
        <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500">Em construção: Upload de fotos</p>
        </div>
      )}
      {PUBLISH_STEPS[activeStep] === "Comodidades do imóvel" && (
        <StepComodities />
      )}
      {PUBLISH_STEPS[activeStep] === "Revisão e publicação" && <StepFinished />}
    </StepperWizard>
  );
}

// ---------------------------------------------------------------------------
// Página
// ---------------------------------------------------------------------------

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
