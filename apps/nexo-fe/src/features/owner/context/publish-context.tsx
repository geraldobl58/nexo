"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

import type { PublishLocationData } from "../schemas/publish-location";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface PublishStepValidity {
  location: boolean;
  // futuros steps adicionados aqui
}

export interface PublishFormData {
  location: Partial<PublishLocationData>;
  // futuros steps adicionados aqui
}

interface PublishContextValue {
  /** Dados persistidos de cada step */
  formData: PublishFormData;
  /** Validade de cada step */
  stepValidity: PublishStepValidity;
  /** Step ativo */
  activeStep: number;
  /** Atualiza parcialmente os dados de localização */
  setLocationData: (data: Partial<PublishLocationData>) => void;
  /** Informa se o step de localização é válido */
  setLocationValid: (valid: boolean) => void;
  /** Navega para o próximo step */
  goNext: () => void;
  /** Volta um step */
  goBack: () => void;
  /** Verifica se o botão "Continuar" do step atual deve estar desabilitado */
  isNextDisabled: () => boolean;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const PublishContext = createContext<PublishContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

const STEPS = [
  "Localização do imóvel",
  "Detalhes do imóvel",
  "Fotos do imóvel",
  "Comodidades do imóvel",
  "Revisão e publicação",
] as const;

export const PUBLISH_STEPS = STEPS;

export function PublishProvider({ children }: { children: ReactNode }) {
  const [activeStep, setActiveStep] = useState(0);

  const [formData, setFormData] = useState<PublishFormData>({
    location: {},
  });

  const [stepValidity, setStepValidity] = useState<PublishStepValidity>({
    location: false,
  });

  const setLocationData = useCallback((data: Partial<PublishLocationData>) => {
    setFormData((prev) => ({
      ...prev,
      location: { ...prev.location, ...data },
    }));
  }, []);

  const setLocationValid = useCallback((valid: boolean) => {
    setStepValidity((prev) => ({ ...prev, location: valid }));
  }, []);

  const isNextDisabled = useCallback(() => {
    const step = STEPS[activeStep];
    if (step === "Localização do imóvel") return !stepValidity.location;
    return false;
  }, [activeStep, stepValidity]);

  const goNext = useCallback(() => {
    setActiveStep((s) => Math.min(s + 1, STEPS.length - 1));
  }, []);

  const goBack = useCallback(() => {
    setActiveStep((s) => Math.max(s - 1, 0));
  }, []);

  return (
    <PublishContext.Provider
      value={{
        formData,
        stepValidity,
        activeStep,
        setLocationData,
        setLocationValid,
        goNext,
        goBack,
        isNextDisabled,
      }}
    >
      {children}
    </PublishContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function usePublish(): PublishContextValue {
  const ctx = useContext(PublishContext);
  if (!ctx) {
    throw new Error("usePublish deve ser usado dentro de <PublishProvider>");
  }
  return ctx;
}
