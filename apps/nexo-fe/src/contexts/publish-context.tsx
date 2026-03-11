"use client";

import { PublishComoditiesData } from "@/features/owner/schemas/publish-comodities.schema";
import { PublishContactData } from "@/features/owner/schemas/publish-contact.schema";
import { PublishDetailsData } from "@/features/owner/schemas/publish-details.schema";
import { PublishLocationData } from "@/features/owner/schemas/publish-location.schema";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

// ---------------------------------------------------------------------------
// sessionStorage persistence helpers
// ---------------------------------------------------------------------------

// Bump this version whenever stored shapes change (e.g. enum values refactor)
// to automatically discard incompatible cached data.
const STORAGE_KEY = "nexo-publish-wizard";
const STORAGE_VERSION = 2;

interface PersistedState {
  version: number;
  activeStep: number;
  formData: PublishFormData;
}

function loadState(): Partial<PersistedState> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as PersistedState;
    // Discard data from older storage versions
    if (parsed.version !== STORAGE_VERSION) {
      sessionStorage.removeItem(STORAGE_KEY);
      return {};
    }
    return parsed;
  } catch {
    return {};
  }
}

function saveState(state: Omit<PersistedState, "version">) {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...state, version: STORAGE_VERSION }),
    );
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
  contact: boolean;
}

export interface PublishFormData {
  location: Partial<PublishLocationData>;
  details: Partial<PublishDetailsData>;
  comodities: Partial<PublishComoditiesData>;
  contact: Partial<PublishContactData>;
}

interface PublishContextValue {
  /** Dados persistidos de cada step */
  formData: PublishFormData;
  /** Validade de cada step */
  stepValidity: PublishStepValidity;
  /** Step ativo */
  activeStep: number;
  /**
   * Arquivos de mídia selecionados no step de fotos.
   * Não são persistidos no sessionStorage (File não é serializável).
   */
  mediaFiles: File[];
  /** Atualiza a lista de arquivos de mídia */
  setMediaFiles: (files: File[]) => void;
  /** Reordena os arquivos de mídia movendo `from` para a posição `to` */
  reorderMediaFiles: (from: number, to: number) => void;
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
  /** Atualiza parcialmente os dados de contato */
  setContactData: (data: Partial<PublishContactData>) => void;
  /** Informa se o step de contato é válido */
  setContactValid: (valid: boolean) => void;
  /** Navega para o próximo step */
  goNext: () => void;
  /** Volta um step */
  goBack: () => void;
  /** Navega diretamente para um step pelo índice */
  goToStep: (step: number) => void;
  /** Verifica se o botão "Continuar" do step atual deve estar desabilitado */
  isNextDisabled: () => boolean;
  /** Zera todo o estado do wizard e limpa o sessionStorage */
  resetPublish: () => void;
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
  "Dados de contato",
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
    return (
      saved.formData ?? {
        location: {},
        details: {},
        comodities: {},
        contact: {},
      }
    );
  });

  const [stepValidity, setStepValidity] = useState<PublishStepValidity>({
    location: false,
    details: false,
    comodities: false,
    contact: false,
  });

  // File objects não são serializáveis — não vão para o sessionStorage.
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);

  const reorderMediaFiles = useCallback((from: number, to: number) => {
    setMediaFiles((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }, []);

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

  const setContactData = useCallback((data: Partial<PublishContactData>) => {
    setFormData((prev) => ({
      ...prev,
      contact: { ...prev.contact, ...data },
    }));
  }, []);

  const setContactValid = useCallback((valid: boolean) => {
    setStepValidity((prev) => ({ ...prev, contact: valid }));
  }, []);

  const isNextDisabled = useCallback(() => {
    const step = STEPS[activeStep];
    if (step === "Localização do imóvel") return !stepValidity.location;
    if (step === "Detalhes do imóvel") return !stepValidity.details;
    if (step === "Comodidades do imóvel") return !stepValidity.comodities;
    if (step === "Fotos do imóvel") return mediaFiles.length === 0;
    if (step === "Dados de contato") return !stepValidity.contact;
    return false;
  }, [activeStep, stepValidity, mediaFiles]);

  const goNext = useCallback(() => {
    setActiveStep((s) => Math.min(s + 1, STEPS.length - 1));
  }, []);

  const goBack = useCallback(() => {
    setActiveStep((s) => Math.max(s - 1, 0));
  }, []);

  const goToStep = useCallback((step: number) => {
    setActiveStep(Math.max(0, Math.min(step, STEPS.length - 1)));
  }, []);

  const resetPublish = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setActiveStep(0);
    setFormData({ location: {}, details: {}, comodities: {}, contact: {} });
    setStepValidity({
      location: false,
      details: false,
      comodities: false,
      contact: false,
    });
    setMediaFiles([]);
  }, []);

  return (
    <PublishContext.Provider
      value={{
        formData,
        stepValidity,
        activeStep,
        mediaFiles,
        setMediaFiles,
        reorderMediaFiles,
        setLocationData,
        setLocationValid,
        setDetailsData,
        setDetailsValid,
        setComoditiesData,
        setComoditiesValid,
        setContactData,
        setContactValid,
        goNext,
        goBack,
        goToStep,
        isNextDisabled,
        resetPublish,
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
