"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { StepperWizard } from "@/components/ui/stepper-wizard/stepper-wizard";
import { createPublication, uploadMediaFiles } from "../actions/publish.action";

import { Purpose, PropertyType } from "../enums/listing.enum";
import { StepLocation } from "./steps/step-location";
import { StepDetails } from "./steps/step-details";
import { StepPhotos } from "./steps/step-photos";
import { StepComodities } from "./steps/step-comodities";
import { StepFinished } from "./steps/step-finished";
import { StepContact } from "./steps/step-contact";

import { PUBLISH_STEPS, usePublish } from "@/contexts/publish-context";

import { useAuth } from "@/features/auth/hooks/use-auth.hook";

export function MyPropertyPublishWizard() {
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
  const queryClient = useQueryClient();
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

    // Invalida o cache para que a listagem reflita o novo imóvel e suas mídias
    if (state.success) {
      await queryClient.invalidateQueries({
        queryKey: ["owner", "my-listings", user?.id ?? ""],
      });
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
