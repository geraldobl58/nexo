"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { StepperWizard } from "@/components/ui/stepper-wizard/stepper-wizard";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { PUBLISH_STEPS, usePublish } from "../context/publish-context";
import { createPublication, uploadMediaFiles } from "../actions/publish";

import { Purpose, PropertyType } from "../enums/publish-details-enums";
import { StepLocation } from "./step-location";
import { StepDetails } from "./step-details";
import { StepPhotos } from "./step-photos";
import { StepComodities } from "./step-comodities";
import { StepFinished } from "./step-finished";
import { StepContact } from "./step-contact";

export function PublishWizardContent() {
  const {
    activeStep,
    goNext,
    goBack,
    isNextDisabled,
    formData,
    resetPublish,
    mediaFiles,
  } = usePublish();
  const { user } = useAuth();
  const isLastStep = activeStep === PUBLISH_STEPS.length - 1;

  const router = useRouter();
  const [isPublishing, setIsPublishing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [publishResult, setPublishResult] = useState<{
    success: boolean;
    message?: string;
  } | null>(null);

  useEffect(() => {
    if (publishResult?.success) {
      const timer = setTimeout(() => {
        resetPublish();
        router.push("/panel");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [publishResult, router, resetPublish]);

  async function handlePublish() {
    if (!user) {
      setPublishResult({
        success: false,
        message: "Você precisa estar autenticado para publicar um imóvel.",
      });
      return;
    }

    const { location, details, comodities } = formData;

    setIsPublishing(true);
    setPublishResult(null);
    setUploadProgress(null);

    const state = await createPublication({
      // Location
      zipcode: location.zipcode ?? "",
      street: location.street ?? "",
      streetNumber: location.streetNumber ?? "",
      district: location.district ?? "",
      complement: location.complement ?? "",
      city: location.city ?? "",
      state: location.state ?? "",
      latitude: location.latitude ?? 0,
      longitude: location.longitude ?? 0,
      // Details
      purpose: details.purpose as Purpose,
      type: details.type as PropertyType,
      title: details.title ?? "",
      description: details.description ?? "",
      price: details.price ?? 0,
      condominiumFee: details.condominiumFee,
      iptuYearly: details.iptuYearly,
      // Comodities
      areaM2: comodities.areaM2 ?? 0,
      builtArea: comodities.builtArea,
      bedrooms: comodities.bedrooms ?? 0,
      suites: comodities.suites,
      bathrooms: comodities.bathrooms ?? 0,
      garageSpots: comodities.garageSpots,
      floor: comodities.floor,
      totalFloors: comodities.totalFloors,
      furnished: comodities.furnished,
      petFriendly: comodities.petFriendly,
      yearBuilt: comodities.yearBuilt,
      acceptsExchange: comodities.acceptsExchange,
      acceptsFinancing: comodities.acceptsFinancing,
      acceptsCarTrade: comodities.acceptsCarTrade,
      isLaunch: comodities.isLaunch,
      isReadyToMove: comodities.isReadyToMove,
    });

    // Se o imóvel foi criado e há arquivos selecionados, faz o upload
    if (state.success && mediaFiles.length > 0) {
      setUploadProgress(`Enviando mídias... 0/${mediaFiles.length}`);
      await uploadMediaFiles(state.data.id, mediaFiles, (uploaded, total) => {
        setUploadProgress(`Enviando mídias... ${uploaded}/${total}`);
      });
      setUploadProgress(null);
    }

    setPublishResult({ success: state.success, message: state.message });
    setIsPublishing(false);
  }

  return (
    <StepperWizard
      steps={[...PUBLISH_STEPS]}
      activeStep={activeStep}
      onNext={isLastStep ? handlePublish : goNext}
      onBack={goBack}
      nextDisabled={
        isNextDisabled() || isPublishing || publishResult?.success === true
      }
      finishLabel={
        uploadProgress ?? (isPublishing ? "Criando imóvel..." : "Finalizar")
      }
    >
      {PUBLISH_STEPS[activeStep] === "Localização do imóvel" && (
        <StepLocation />
      )}
      {PUBLISH_STEPS[activeStep] === "Detalhes do imóvel" && <StepDetails />}
      {PUBLISH_STEPS[activeStep] === "Fotos do imóvel" && <StepPhotos />}
      {PUBLISH_STEPS[activeStep] === "Comodidades do imóvel" && (
        <StepComodities />
      )}
      {PUBLISH_STEPS[activeStep] === "Dados de contato" && <StepContact />}
      {PUBLISH_STEPS[activeStep] === "Revisão e publicação" && (
        <StepFinished publishResult={publishResult} />
      )}
    </StepperWizard>
  );
}
