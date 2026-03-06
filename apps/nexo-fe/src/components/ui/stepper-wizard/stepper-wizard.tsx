import { Button, Step, StepLabel, Stepper } from "@mui/material";

export type StepperWizardProps = {
  steps: string[];
  activeStep: number;
  children?: React.ReactNode;
  orientation?: "horizontal" | "vertical";
  onNext?: () => void;
  onBack?: () => void;
  nextDisabled?: boolean;
  backLabel?: string;
  nextLabel?: string;
  finishLabel?: string;
};

export const StepperWizard = ({
  steps,
  activeStep,
  children,
  orientation = "horizontal",
  onNext,
  onBack,
  nextDisabled = false,
  backLabel = "Voltar",
  nextLabel = "Continuar",
  finishLabel = "Finalizar",
}: StepperWizardProps) => {
  const isLastStep = activeStep === steps.length - 1;
  const isVertical = orientation === "vertical";

  return (
    <div className="flex flex-col gap-4">
      <Stepper
        activeStep={activeStep}
        alternativeLabel={!isVertical}
        orientation={orientation}
      >
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {children && <div>{children}</div>}

      <div className="flex flex-row items-center justify-end rounded-lg gap-4 p-4 bg-white">
        <Button
          color="warning"
          disabled={activeStep === 0}
          onClick={onBack}
          variant="outlined"
        >
          {backLabel}
        </Button>

        <Button onClick={onNext} variant="contained" disabled={nextDisabled}>
          {isLastStep ? finishLabel : nextLabel}
        </Button>
      </div>
    </div>
  );
};
