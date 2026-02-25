"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { PublishLocationData } from "../schemas/publish-location";
import type { PublishDetailsData } from "../schemas/publish-details";
import type { PublishComoditiesData } from "../schemas/publish-comodities";

// ---------------------------------------------------------------------------
// sessionStorage persistence helpers
// ---------------------------------------------------------------------------

const STORAGE_KEY = "nexo-publish-wizard";

interface PersistedState {
  activeStep: number;
  formData: PublishFormData;
}

function loadState(): Partial<PersistedState> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PersistedState) : {};
  } catch {
    return {};
  }
}

function saveState(state: PersistedState) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // sessionStorage quota exceeded or unavailable — fail silently
  }
}

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface PublishStepValidity {
  location: boolean;
  details: boolean;
  comodities: boolean;
}

export interface PublishFormData {
  location: Partial<PublishLocationData>;
  details: Partial<PublishDetailsData>;
  comodities: Partial<PublishComoditiesData>;
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
  /** Atualiza parcialmente os dados de detalhes */
  setDetailsData: (data: Partial<PublishDetailsData>) => void;
  /** Informa se o step de detalhes é válido */
  setDetailsValid: (valid: boolean) => void;
  /** Atualiza parcialmente os dados de comodidades */
  setComoditiesData: (data: Partial<PublishComoditiesData>) => void;
  /** Informa se o step de comodidades é válido */
  setComoditiesValid: (valid: boolean) => void;
  /** Navega para o próximo step */
  goNext: () => void;
  /** Volta um step */
  goBack: () => void;
  /** Navega diretamente para um step pelo índice */
  goToStep: (step: number) => void;
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
  // Inicializadores lazy leem o sessionStorage diretamente na primeira renderização.
  // Não há risco de hydration mismatch porque este provider só é montado
  // client-side, dentro do ProtectedRoute (que bloqueia o SSR).
  const [activeStep, setActiveStep] = useState<number>(() => {
    const saved = loadState();
    return saved.activeStep ?? 0;
  });

  const [formData, setFormData] = useState<PublishFormData>(() => {
    const saved = loadState();
    return saved.formData ?? { location: {}, details: {}, comodities: {} };
  });

  const [stepValidity, setStepValidity] = useState<PublishStepValidity>({
    location: false,
    details: false,
    comodities: false,
  });

  // Persiste activeStep + formData sempre que mudarem.
  useEffect(() => {
    saveState({ activeStep, formData });
  }, [activeStep, formData]);

  const setLocationData = useCallback((data: Partial<PublishLocationData>) => {
    setFormData((prev) => ({
      ...prev,
      location: { ...prev.location, ...data },
    }));
  }, []);

  const setLocationValid = useCallback((valid: boolean) => {
    setStepValidity((prev) => ({ ...prev, location: valid }));
  }, []);

  const setDetailsData = useCallback((data: Partial<PublishDetailsData>) => {
    setFormData((prev) => ({
      ...prev,
      details: { ...prev.details, ...data },
    }));
  }, []);

  const setDetailsValid = useCallback((valid: boolean) => {
    setStepValidity((prev) => ({ ...prev, details: valid }));
  }, []);

  const setComoditiesData = useCallback(
    (data: Partial<PublishComoditiesData>) => {
      setFormData((prev) => ({
        ...prev,
        comodities: { ...prev.comodities, ...data },
      }));
    },
    [],
  );

  const setComoditiesValid = useCallback((valid: boolean) => {
    setStepValidity((prev) => ({ ...prev, comodities: valid }));
  }, []);

  const isNextDisabled = useCallback(() => {
    const step = STEPS[activeStep];
    if (step === "Localização do imóvel") return !stepValidity.location;
    if (step === "Detalhes do imóvel") return !stepValidity.details;
    if (step === "Comodidades do imóvel") return !stepValidity.comodities;
    return false;
  }, [activeStep, stepValidity]);

  const goNext = useCallback(() => {
    setActiveStep((s) => Math.min(s + 1, STEPS.length - 1));
  }, []);

  const goBack = useCallback(() => {
    setActiveStep((s) => Math.max(s - 1, 0));
  }, []);

  const goToStep = useCallback((step: number) => {
    setActiveStep(Math.max(0, Math.min(step, STEPS.length - 1)));
  }, []);

  return (
    <PublishContext.Provider
      value={{
        formData,
        stepValidity,
        activeStep,
        setLocationData,
        setLocationValid,
        setDetailsData,
        setDetailsValid,
        setComoditiesData,
        setComoditiesValid,
        goNext,
        goBack,
        goToStep,
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
