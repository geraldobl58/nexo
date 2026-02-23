import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { StepperWizard } from "./StepperWizard";

const defaultSteps = ["Localização", "Detalhes", "Fotos", "Revisão"];

describe("StepperWizard", () => {
  describe("renderização básica", () => {
    it("renderiza todos os labels dos steps", () => {
      render(<StepperWizard steps={defaultSteps} activeStep={0} />);
      defaultSteps.forEach((step) => {
        expect(screen.getByText(step)).toBeInTheDocument();
      });
    });

    it("renderiza o botão Voltar", () => {
      render(<StepperWizard steps={defaultSteps} activeStep={1} />);
      expect(
        screen.getByRole("button", { name: /voltar/i }),
      ).toBeInTheDocument();
    });

    it("renderiza o botão Continuar quando não é o último step", () => {
      render(<StepperWizard steps={defaultSteps} activeStep={0} />);
      expect(
        screen.getByRole("button", { name: /continuar/i }),
      ).toBeInTheDocument();
    });

    it("renderiza o botão Finalizar no último step", () => {
      render(
        <StepperWizard
          steps={defaultSteps}
          activeStep={defaultSteps.length - 1}
        />,
      );
      expect(
        screen.getByRole("button", { name: /finalizar/i }),
      ).toBeInTheDocument();
    });

    it("renderiza children quando fornecido", () => {
      render(
        <StepperWizard steps={defaultSteps} activeStep={0}>
          <p>Conteúdo do step</p>
        </StepperWizard>,
      );
      expect(screen.getByText("Conteúdo do step")).toBeInTheDocument();
    });
  });

  describe("estado dos botões", () => {
    it("desabilita o botão Voltar no primeiro step", () => {
      render(<StepperWizard steps={defaultSteps} activeStep={0} />);
      expect(screen.getByRole("button", { name: /voltar/i })).toBeDisabled();
    });

    it("habilita o botão Voltar a partir do segundo step", () => {
      render(<StepperWizard steps={defaultSteps} activeStep={1} />);
      expect(
        screen.getByRole("button", { name: /voltar/i }),
      ).not.toBeDisabled();
    });

    it("desabilita o botão Continuar quando nextDisabled=true", () => {
      render(
        <StepperWizard steps={defaultSteps} activeStep={0} nextDisabled />,
      );
      expect(screen.getByRole("button", { name: /continuar/i })).toBeDisabled();
    });

    it("habilita o botão Continuar quando nextDisabled=false", () => {
      render(
        <StepperWizard
          steps={defaultSteps}
          activeStep={0}
          nextDisabled={false}
        />,
      );
      expect(
        screen.getByRole("button", { name: /continuar/i }),
      ).not.toBeDisabled();
    });
  });

  describe("interações", () => {
    it("chama onNext ao clicar em Continuar", async () => {
      const onNext = vi.fn();
      render(
        <StepperWizard steps={defaultSteps} activeStep={1} onNext={onNext} />,
      );
      await userEvent.click(screen.getByRole("button", { name: /continuar/i }));
      expect(onNext).toHaveBeenCalledTimes(1);
    });

    it("chama onBack ao clicar em Voltar", async () => {
      const onBack = vi.fn();
      render(
        <StepperWizard steps={defaultSteps} activeStep={1} onBack={onBack} />,
      );
      await userEvent.click(screen.getByRole("button", { name: /voltar/i }));
      expect(onBack).toHaveBeenCalledTimes(1);
    });

    it("chama onNext ao clicar em Finalizar no último step", async () => {
      const onNext = vi.fn();
      render(
        <StepperWizard
          steps={defaultSteps}
          activeStep={defaultSteps.length - 1}
          onNext={onNext}
        />,
      );
      await userEvent.click(screen.getByRole("button", { name: /finalizar/i }));
      expect(onNext).toHaveBeenCalledTimes(1);
    });
  });

  describe("labels customizáveis", () => {
    it("renderiza label de voltar customizado", () => {
      render(
        <StepperWizard
          steps={defaultSteps}
          activeStep={1}
          backLabel="Anterior"
        />,
      );
      expect(
        screen.getByRole("button", { name: /anterior/i }),
      ).toBeInTheDocument();
    });

    it("renderiza label de próximo customizado", () => {
      render(
        <StepperWizard
          steps={defaultSteps}
          activeStep={0}
          nextLabel="Avançar"
        />,
      );
      expect(
        screen.getByRole("button", { name: /avançar/i }),
      ).toBeInTheDocument();
    });

    it("renderiza label de finalizar customizado", () => {
      render(
        <StepperWizard
          steps={defaultSteps}
          activeStep={defaultSteps.length - 1}
          finishLabel="Publicar"
        />,
      );
      expect(
        screen.getByRole("button", { name: /publicar/i }),
      ).toBeInTheDocument();
    });
  });

  describe("orientação", () => {
    it("renderiza orientação horizontal por padrão", () => {
      const { container } = render(
        <StepperWizard steps={defaultSteps} activeStep={0} />,
      );
      expect(
        container.querySelector(".MuiStepper-horizontal"),
      ).toBeInTheDocument();
    });

    it("renderiza orientação vertical quando orientation='vertical'", () => {
      const { container } = render(
        <StepperWizard
          steps={defaultSteps}
          activeStep={0}
          orientation="vertical"
        />,
      );
      expect(
        container.querySelector(".MuiStepper-vertical"),
      ).toBeInTheDocument();
    });
  });
});
