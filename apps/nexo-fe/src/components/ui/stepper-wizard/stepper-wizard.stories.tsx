/* eslint-disable react-hooks/rules-of-hooks */
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { useState } from "react";
import { StepperWizard } from "./stepper-wizard";

const defaultSteps = [
  "Localização do imóvel",
  "Detalhes do imóvel",
  "Fotos do imóvel",
  "Comodidades do imóvel",
  "Revisão e publicação",
];

const meta = {
  title: "Components/StepperWizard",
  component: StepperWizard,
  parameters: {
    layout: "padded",
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ["autodocs"],
  args: {
    steps: defaultSteps,
    activeStep: 0,
    onNext: fn(),
    onBack: fn(),
  },
} satisfies Meta<typeof StepperWizard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "Horizontal (padrão)",
  args: {
    activeStep: 0,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const step of defaultSteps) {
      await expect(canvas.getByText(step)).toBeInTheDocument();
    }

    await expect(
      canvas.getByRole("button", { name: /voltar/i }),
    ).toBeDisabled();
    await expect(
      canvas.getByRole("button", { name: /continuar/i }),
    ).toBeInTheDocument();
  },
};

export const Vertical: Story = {
  name: "Vertical",
  args: {
    orientation: "vertical",
    activeStep: 1,
  },
};

export const StepIntermediario: Story = {
  name: "Step intermediário",
  args: {
    activeStep: 2,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("button", { name: /voltar/i }),
    ).not.toBeDisabled();
    await expect(
      canvas.getByRole("button", { name: /continuar/i }),
    ).toBeInTheDocument();
  },
};

export const UltimoStep: Story = {
  name: "Último step (Finalizar)",
  args: {
    activeStep: defaultSteps.length - 1,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("button", { name: /finalizar/i }),
    ).toBeInTheDocument();
  },
};

export const NextDesabilitado: Story = {
  name: "Continuar desabilitado",
  args: {
    activeStep: 0,
    nextDisabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("button", { name: /continuar/i }),
    ).toBeDisabled();
  },
};

export const ComConteudo: Story = {
  name: "Com conteúdo de step",
  args: {
    activeStep: 0,
    children: (
      <div className="rounded-lg bg-white p-6 text-sm text-muted-foreground">
        Conteúdo do step atual renderizado aqui.
      </div>
    ),
  },
};

export const LabelsCustomizados: Story = {
  name: "Labels customizados",
  args: {
    activeStep: defaultSteps.length - 1,
    backLabel: "Anterior",
    nextLabel: "Avançar",
    finishLabel: "Publicar anúncio",
  },
};

export const Interativo: Story = {
  name: "Interativo (controlado)",
  render: (args) => {
    const [activeStep, setActiveStep] = useState(0);
    return (
      <StepperWizard
        {...args}
        activeStep={activeStep}
        onNext={() =>
          setActiveStep((prev) => Math.min(prev + 1, defaultSteps.length - 1))
        }
        onBack={() => setActiveStep((prev) => Math.max(prev - 1, 0))}
      >
        <div className="rounded-lg bg-white p-6 text-center text-sm text-muted-foreground">
          Você está no step <strong>{activeStep + 1}</strong>:{" "}
          <strong>{defaultSteps[activeStep]}</strong>
        </div>
      </StepperWizard>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText(defaultSteps[0])).toBeInTheDocument();

    await userEvent.click(canvas.getByRole("button", { name: /continuar/i }));
    await expect(canvas.getByText(/step 2/i)).toBeInTheDocument();

    await userEvent.click(canvas.getByRole("button", { name: /voltar/i }));
    await expect(canvas.getByText(/step 1/i)).toBeInTheDocument();
  },
};

export const VerticalInterativo: Story = {
  name: "Vertical Interativo",
  render: (args) => {
    const [activeStep, setActiveStep] = useState(0);
    return (
      <StepperWizard
        {...args}
        orientation="vertical"
        activeStep={activeStep}
        onNext={() =>
          setActiveStep((prev) => Math.min(prev + 1, defaultSteps.length - 1))
        }
        onBack={() => setActiveStep((prev) => Math.max(prev - 1, 0))}
      >
        <div className="rounded-lg bg-white p-6 text-sm text-muted-foreground">
          Step {activeStep + 1}: {defaultSteps[activeStep]}
        </div>
      </StepperWizard>
    );
  },
};
