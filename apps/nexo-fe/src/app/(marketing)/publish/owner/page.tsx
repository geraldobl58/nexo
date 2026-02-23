"use client";

import { useState } from "react";

import { Heading } from "@/components/ui/Heading/Heading";
import { StepperWizard } from "@/components/ui/StepperWizard/StepperWizard";
import { StepLocation } from "../../../../features/owner/components/step-location";

const steps = [
  "Localização do imóvel",
  "Detalhes do imóvel",
  "Fotos do imóvel",
  "Comodidades do imóvel",
  "Revisão e publicação",
];

const PageOwner = () => {
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <div className="bg-primary/5">
      <div className="flex flex-col gap-4 px-4 py-12 space-y-4 max-w-7xl mx-auto">
        <Heading
          align="center"
          title="Faça seu cadastro em poucos passos"
          description="Preencha as informações do seu imóvel para criar o anúncio e começar a receber propostas de interessados."
        />

        <StepperWizard
          steps={steps}
          activeStep={activeStep}
          onNext={handleNext}
          onBack={handleBack}
          // nextDisabled
        >
          {steps[activeStep] === "Localização do imóvel" && <StepLocation />}
          {steps[activeStep] === "Detalhes do imóvel" && (
            <div>Detalhes do imóvel</div>
          )}
        </StepperWizard>
      </div>
    </div>
  );
};

export default PageOwner;
