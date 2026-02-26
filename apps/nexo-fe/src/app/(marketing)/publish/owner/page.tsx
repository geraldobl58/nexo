"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
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
import { createPublication } from "@/features/owner/actions/publish";
import { useAuth } from "@/features/auth/hooks/use-auth";
import {
  Purpose,
  PropertyType,
} from "@/features/owner/enums/publish-details-enums";
import { getMyAdvertiser } from "@/features/owner/http/advertisers";

// ---------------------------------------------------------------------------
// Conteúdo interno (precisa estar dentro do Provider para usar usePublish)
// ---------------------------------------------------------------------------

function PublishWizardContent() {
  const { activeStep, goNext, goBack, isNextDisabled, formData, resetPublish } =
    usePublish();
  const { user } = useAuth();
  const isLastStep = activeStep === PUBLISH_STEPS.length - 1;

  const router = useRouter();
  const [isPublishing, setIsPublishing] = useState(false);
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

  // Busca (ou cria) o registro de Advertiser do usuário autenticado via /advertisers/me.
  // O endpoint faz lookup por keycloakId (JWT) com fallback por e-mail e auto-cria se necessário.
  const {
    data: advertiser,
    isLoading: isLoadingAdvertiser,
    error: advertiserError,
  } = useQuery({
    queryKey: ["advertiser", "me"],
    queryFn: () => getMyAdvertiser(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  async function handlePublish() {
    if (!advertiser?.id) {
      setPublishResult({
        success: false,
        message:
          advertiserError instanceof Error
            ? advertiserError.message
            : "Erro ao carregar dados do anunciante. Tente novamente.",
      });
      return;
    }
    const { location, details, comodities } = formData;

    setIsPublishing(true);
    setPublishResult(null);

    const state = await createPublication({
      advertiserId: advertiser.id,
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
        isNextDisabled() ||
        isPublishing ||
        publishResult?.success === true ||
        (isLastStep && isLoadingAdvertiser)
      }
      finishLabel={isPublishing ? "Publicando..." : "Finalizar"}
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
      {PUBLISH_STEPS[activeStep] === "Revisão e publicação" && (
        <StepFinished publishResult={publishResult} />
      )}
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
