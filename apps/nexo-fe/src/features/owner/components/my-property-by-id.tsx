"use client";

import { useSyncExternalStore } from "react";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";

import { Alert, Chip, CircularProgress, Divider } from "@mui/material";
import {
  Bath,
  BedDouble,
  Building2,
  Car,
  Home,
  Mail,
  MapPin,
  Phone,
  Ruler,
  MessageCircle,
} from "lucide-react";

import keycloak from "@/lib/keycloak";
import { getListingById } from "../services/listing.service";
import {
  PropertyType,
  PropertyTypeLabel,
  StatusLabel,
  Listing,
} from "../enums/listing.enum";
import { CreatePublishResponse } from "../types/publish.type";
import { InfoItem } from "@/components/ui/info-item/info-item";

import { formatCurrency } from "@/lib/formatted-money";

// ---------------------------------------------------------------------------
// Keycloak ready guard — waits for keycloak.init() to fully resolve so the
// JWT interceptor is in place before the query fires (needed for DRAFT access)
// ---------------------------------------------------------------------------

function subscribeToKeycloakReady(callback: () => void) {
  keycloak.onReady = callback;
  keycloak.onAuthSuccess = callback;
  return () => {
    keycloak.onReady = undefined;
    keycloak.onAuthSuccess = undefined;
  };
}

function getKeycloakReady() {
  return keycloak.authenticated !== undefined;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MyPropertyById({ id }: { id: string }) {
  // Wait for keycloak.init() to fully resolve (keycloak.authenticated !== undefined)
  // before firing the query. Without this, a sessionStorage token makes authLoading
  // flip to false BEFORE the JWT is attached → 404 on DRAFT listings.
  const keycloakReady = useSyncExternalStore(
    subscribeToKeycloakReady,
    getKeycloakReady,
    () => false,
  );

  const {
    data: listing,
    isLoading,
    error,
  } = useQuery<CreatePublishResponse>({
    queryKey: ["listing", id],
    queryFn: () => getListingById(id),
    enabled: keycloakReady && !!id,
    staleTime: 5 * 60 * 1000,
  });

  if (!keycloakReady || isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <CircularProgress />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Alert severity="error">Imóvel não encontrado ou indisponível.</Alert>
      </div>
    );
  }

  const images = listing.media?.filter((m) => m.type === "IMAGE") ?? [];
  const mainImage = images[0];

  const statusColor =
    listing.status === "ACTIVE"
      ? "success"
      : listing.status === "DRAFT"
        ? "default"
        : listing.status === "INACTIVE"
          ? "warning"
          : "error";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* ── Galeria de imagens ────────────────────────────────────────────── */}
      <div className="w-full rounded-xl overflow-hidden bg-gray-100">
        {mainImage ? (
          <div className="relative w-full h-96">
            <Image
              src={mainImage.url}
              alt={listing.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        ) : (
          <div className="w-full h-64 flex items-center justify-center text-gray-400">
            <Home size={64} />
          </div>
        )}
        {images.length > 1 && (
          <div className="flex gap-2 p-2 overflow-x-auto">
            {images.slice(1).map((img) => (
              <div
                key={img.id}
                className="relative w-24 h-16 shrink-0 rounded overflow-hidden"
              >
                <Image
                  src={img.url}
                  alt={listing.title}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Cabeçalho ─────────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2 items-center">
          <Chip
            label={StatusLabel[listing.status as Listing]}
            color={statusColor}
            size="small"
          />
          <Chip
            label={listing.purpose === "SALE" ? "Venda" : "Aluguel"}
            variant="outlined"
            size="small"
          />
          <Chip
            label={
              PropertyTypeLabel[listing.type as PropertyType] ?? listing.type
            }
            variant="outlined"
            size="small"
          />
        </div>

        <h1 className="text-3xl font-bold text-gray-900">{listing.title}</h1>

        <div className="flex items-center gap-1 text-gray-500 text-sm">
          <MapPin size={14} />
          <span>
            {[
              listing.street,
              listing.streetNumber,
              listing.district,
              listing.city,
              listing.state,
            ]
              .filter(Boolean)
              .join(", ")}
          </span>
        </div>

        <div className="text-3xl font-bold text-primary">
          {formatCurrency(listing.price)}
          {listing.purpose === "RENT" && (
            <span className="text-lg font-normal text-gray-500">/mês</span>
          )}
        </div>

        {(listing.condominiumFee || listing.iptuYearly) && (
          <div className="flex gap-4 text-sm text-gray-500">
            {listing.condominiumFee && (
              <span>
                Condomínio: {formatCurrency(listing.condominiumFee)}/mês
              </span>
            )}
            {listing.iptuYearly && (
              <span>IPTU: {formatCurrency(listing.iptuYearly)}/ano</span>
            )}
          </div>
        )}
      </div>

      <Divider />

      {/* ── Características ───────────────────────────────────────────────── */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Características</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {listing.areaM2 && (
            <InfoItem
              icon={<Ruler size={20} />}
              label="Área total"
              value={`${listing.areaM2} m²`}
            />
          )}
          {listing.builtArea && (
            <InfoItem
              icon={<Building2 size={20} />}
              label="Área construída"
              value={`${listing.builtArea} m²`}
            />
          )}
          {listing.bedrooms != null && (
            <InfoItem
              icon={<BedDouble size={20} />}
              label="Quartos"
              value={listing.bedrooms}
            />
          )}
          {listing.bathrooms != null && (
            <InfoItem
              icon={<Bath size={20} />}
              label="Banheiros"
              value={listing.bathrooms}
            />
          )}
          {listing.garageSpots != null && (
            <InfoItem
              icon={<Car size={20} />}
              label="Vagas"
              value={listing.garageSpots}
            />
          )}
          {listing.suites != null && (
            <InfoItem
              icon={<BedDouble size={20} />}
              label="Suítes"
              value={listing.suites}
            />
          )}
          {listing.floor != null && (
            <InfoItem
              icon={<Building2 size={20} />}
              label="Andar"
              value={listing.floor}
            />
          )}
          {listing.yearBuilt && (
            <InfoItem
              icon={<Home size={20} />}
              label="Construído em"
              value={listing.yearBuilt}
            />
          )}
        </div>
      </div>

      {/* ── Flags booleanas ───────────────────────────────────────────────── */}
      {(listing.furnished ||
        listing.petFriendly ||
        listing.acceptsFinancing ||
        listing.acceptsExchange ||
        listing.isLaunch ||
        listing.isReadyToMove) && (
        <div className="flex flex-wrap gap-2">
          {listing.furnished && (
            <Chip label="Mobiliado" color="primary" variant="outlined" />
          )}
          {listing.petFriendly && (
            <Chip label="Aceita animais" color="primary" variant="outlined" />
          )}
          {listing.acceptsFinancing && (
            <Chip
              label="Aceita financiamento"
              color="primary"
              variant="outlined"
            />
          )}
          {listing.acceptsExchange && (
            <Chip label="Aceita troca" color="primary" variant="outlined" />
          )}
          {listing.acceptsCarTrade && (
            <Chip
              label="Aceita veículo na troca"
              color="primary"
              variant="outlined"
            />
          )}
          {listing.isLaunch && (
            <Chip label="Lançamento" color="secondary" variant="outlined" />
          )}
          {listing.isReadyToMove && (
            <Chip
              label="Pronto para morar"
              color="success"
              variant="outlined"
            />
          )}
        </div>
      )}

      {/* ── Descrição ─────────────────────────────────────────────────────── */}
      {listing.description && (
        <>
          <Divider />
          <div>
            <h2 className="text-xl font-semibold mb-3">Descrição</h2>
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">
              {listing.description}
            </p>
          </div>
        </>
      )}

      {/* ── Contato ───────────────────────────────────────────────────────── */}
      {(listing.contactName ||
        listing.contactPhone ||
        listing.contactEmail ||
        listing.contactWhatsApp) && (
        <>
          <Divider />
          <div>
            <h2 className="text-xl font-semibold mb-4">Entre em contato</h2>
            <div className="bg-gray-50 rounded-xl p-5 space-y-3">
              {listing.contactName && (
                <p className="font-semibold text-gray-900">
                  {listing.contactName}
                </p>
              )}
              <div className="flex flex-wrap gap-4">
                {listing.contactPhone && (
                  <a
                    href={`tel:${listing.contactPhone}`}
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <Phone size={16} />
                    {listing.contactPhone}
                  </a>
                )}
                {listing.contactWhatsApp && (
                  <a
                    href={`https://wa.me/${listing.contactWhatsApp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-green-600 hover:underline"
                  >
                    <MessageCircle size={16} />
                    WhatsApp
                  </a>
                )}
                {listing.contactEmail && (
                  <a
                    href={`mailto:${listing.contactEmail}`}
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <Mail size={16} />
                    {listing.contactEmail}
                  </a>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
