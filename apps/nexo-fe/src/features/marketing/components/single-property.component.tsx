"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";

import { Alert, Chip, CircularProgress, Divider } from "@mui/material";
import {
  Armchair,
  ArrowRightLeft,
  Bath,
  Bed,
  Blocks,
  CalendarSync,
  CarFront,
  DollarSign,
  LandPlot,
  LocateFixed,
  PawPrint,
  Rocket,
  Scan,
  ShowerHead,
  Warehouse,
} from "lucide-react";

import { InfoItem } from "@/components/ui/info-item/info-item";
import { formatCurrency } from "@/lib/formatted-money";
import {
  PropertyType,
  PropertyTypeLabel,
} from "@/features/owner/enums/listing.enum";

import { getMarketingBySlug } from "../services/marketing.service";
import { MediaItem, MarketingResponse } from "../types/marketing.type";
import { Comodities } from "@/components/ui/comodities/comodities";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function purposeLabel(purpose: string) {
  return purpose === "SALE" ? "Venda" : "Aluguel";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const SingleProperty = ({ slug }: { slug: string }) => {
  const {
    data: listing,
    isLoading,
    error,
  } = useQuery<MarketingResponse>({
    queryKey: ["marketing", "slug", slug],
    queryFn: () => getMarketingBySlug(slug),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  console.log("Listing data:", listing);

  if (isLoading) {
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

  const images: MediaItem[] =
    listing.media?.filter((m) => m.type === "IMAGE") ?? [];
  const mainImage = images[0];

  return (
    // <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
    //   {/* ── Galeria ──────────────────────────────────────────────────────── */}
    //   <div className="w-full rounded-xl overflow-hidden bg-gray-100">
    //     {mainImage ? (
    //       <div className="relative w-full h-96">
    //         <Image
    //           src={mainImage.url}
    //           alt={listing.title}
    //           fill
    //           className="object-cover"
    //           priority
    //         />
    //       </div>
    //     ) : (
    //       <div className="w-full h-64 flex items-center justify-center text-gray-400">
    //         <Home size={64} />
    //       </div>
    //     )}
    //     {images.length > 1 && (
    //       <div className="flex gap-2 p-2 overflow-x-auto">
    //         {images.slice(1).map((img) => (
    //           <div
    //             key={img.id}
    //             className="relative w-24 h-16 shrink-0 rounded overflow-hidden"
    //           >
    //             <Image
    //               src={img.url}
    //               alt={listing.title}
    //               fill
    //               className="object-cover"
    //             />
    //           </div>
    //         ))}
    //       </div>
    //     )}
    //   </div>

    //   {/* ── Cabeçalho ─────────────────────────────────────────────────────── */}
    //   <div className="space-y-2">
    //     <div className="flex flex-wrap gap-2 items-center">
    //       <Chip
    //         label={purposeLabel(listing.purpose)}
    //         variant="outlined"
    //         size="small"
    //       />
    //       <Chip
    //         label={
    //           PropertyTypeLabel[listing.type as PropertyType] ?? listing.type
    //         }
    //         variant="outlined"
    //         size="small"
    //       />
    //     </div>

    //     <h1 className="text-3xl font-bold text-gray-900">{listing.title}</h1>

    //     <div className="flex items-center gap-1 text-gray-500 text-sm">
    //       <MapPin size={14} />
    //       <span>
    //         {[
    //           listing.street,
    //           listing.streetNumber,
    //           listing.district,
    //           listing.city,
    //           listing.state,
    //         ]
    //           .filter(Boolean)
    //           .join(", ")}
    //       </span>
    //     </div>

    //     <div className="text-3xl font-bold text-primary">
    //       {formatCurrency(listing.price)}
    //       {listing.purpose === "RENT" && (
    //         <span className="text-lg font-normal text-gray-500">/mês</span>
    //       )}
    //     </div>

    //     {(listing.condominiumFee || listing.iptuYearly) && (
    //       <div className="flex gap-4 text-sm text-gray-500">
    //         {listing.condominiumFee && (
    //           <span>
    //             Condomínio: {formatCurrency(listing.condominiumFee)}/mês
    //           </span>
    //         )}
    //         {listing.iptuYearly && (
    //           <span>IPTU: {formatCurrency(listing.iptuYearly)}/ano</span>
    //         )}
    //       </div>
    //     )}
    //   </div>

    //   <Divider />

    //   {/* ── Características ───────────────────────────────────────────────── */}
    //   <div>
    //     <h2 className="text-xl font-semibold mb-4">Características</h2>
    //     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
    //       {listing.areaM2 && (
    //         <InfoItem
    //           icon={<Ruler size={22} className="text-primary" />}
    //           label="Área total"
    //           value={`${listing.areaM2} m²`}
    //         />
    //       )}
    //       {listing.builtArea && (
    //         <InfoItem
    //           icon={<Building2 size={22} className="text-primary" />}
    //           label="Área construída"
    //           value={`${listing.builtArea} m²`}
    //         />
    //       )}
    //       {listing.bedrooms != null && (
    //         <InfoItem
    //           icon={<BedDouble size={22} className="text-primary" />}
    //           label="Quartos"
    //           value={listing.bedrooms}
    //         />
    //       )}
    //       {listing.bathrooms != null && (
    //         <InfoItem
    //           icon={<Bath size={22} className="text-primary" />}
    //           label="Banheiros"
    //           value={listing.bathrooms}
    //         />
    //       )}
    //       {listing.garageSpots != null && (
    //         <InfoItem
    //           icon={<Car size={22} className="text-primary" />}
    //           label="Vagas"
    //           value={listing.garageSpots}
    //         />
    //       )}
    //       {listing.suites != null && (
    //         <InfoItem
    //           icon={<BedDouble size={22} className="text-primary" />}
    //           label="Suítes"
    //           value={listing.suites}
    //         />
    //       )}
    //       {listing.floor != null && (
    //         <InfoItem
    //           icon={<Building2 size={22} className="text-primary" />}
    //           label="Andar"
    //           value={listing.floor}
    //         />
    //       )}
    //       {listing.yearBuilt && (
    //         <InfoItem
    //           icon={<Home size={22} className="text-primary" />}
    //           label="Construído em"
    //           value={listing.yearBuilt}
    //         />
    //       )}
    //     </div>
    //   </div>

    //   {/* ── Flags booleanas ───────────────────────────────────────────────── */}
    //   {(listing.furnished ||
    //     listing.petFriendly ||
    //     listing.acceptsFinancing ||
    //     listing.acceptsExchange ||
    //     listing.acceptsCarTrade ||
    //     listing.isLaunch ||
    //     listing.isReadyToMove) && (
    //     <div className="flex flex-wrap gap-2">
    //       {listing.furnished && (
    //         <Chip label="Mobiliado" color="primary" variant="outlined" />
    //       )}
    //       {listing.petFriendly && (
    //         <Chip label="Aceita animais" color="primary" variant="outlined" />
    //       )}
    //       {listing.acceptsFinancing && (
    //         <Chip
    //           label="Aceita financiamento"
    //           color="primary"
    //           variant="outlined"
    //         />
    //       )}
    //       {listing.acceptsExchange && (
    //         <Chip label="Aceita troca" color="primary" variant="outlined" />
    //       )}
    //       {listing.acceptsCarTrade && (
    //         <Chip
    //           label="Aceita veículo na troca"
    //           color="primary"
    //           variant="outlined"
    //         />
    //       )}
    //       {listing.isLaunch && (
    //         <Chip label="Lançamento" color="secondary" variant="outlined" />
    //       )}
    //       {listing.isReadyToMove && (
    //         <Chip
    //           label="Pronto para morar"
    //           color="success"
    //           variant="outlined"
    //         />
    //       )}
    //     </div>
    //   )}

    //   {/* ── Descrição ─────────────────────────────────────────────────────── */}
    //   {listing.description && (
    //     <>
    //       <Divider />
    //       <div>
    //         <h2 className="text-xl font-semibold mb-3">Descrição</h2>
    //         <p className="text-gray-700 whitespace-pre-line leading-relaxed">
    //           {listing.description}
    //         </p>
    //       </div>
    //     </>
    //   )}

    //   {/* ── Contato ───────────────────────────────────────────────────────── */}
    //   {(listing.contactName ||
    //     listing.contactPhone ||
    //     listing.contactEmail ||
    //     listing.contactWhatsApp) && (
    //     <>
    //       <Divider />
    //       <div>
    //         <h2 className="text-xl font-semibold mb-4">Entre em contato</h2>
    //         <div className="bg-gray-50 rounded-xl p-5 space-y-3">
    //           {listing.contactName && (
    //             <p className="font-semibold text-gray-900">
    //               {listing.contactName}
    //             </p>
    //           )}
    //           <div className="flex flex-wrap gap-4">
    //             {listing.contactPhone && (
    //               <a
    //                 href={`tel:${listing.contactPhone}`}
    //                 className="flex items-center gap-2 text-primary hover:underline"
    //               >
    //                 <Phone size={16} />
    //                 {listing.contactPhone}
    //               </a>
    //             )}
    //             {listing.contactWhatsApp && (
    //               <a
    //                 href={`https://wa.me/${listing.contactWhatsApp.replace(/\D/g, "")}`}
    //                 target="_blank"
    //                 rel="noopener noreferrer"
    //                 className="flex items-center gap-2 text-green-600 hover:underline"
    //               >
    //                 <MessageCircle size={16} />
    //                 WhatsApp
    //               </a>
    //             )}
    //             {listing.contactEmail && (
    //               <a
    //                 href={`mailto:${listing.contactEmail}`}
    //                 className="flex items-center gap-2 text-primary hover:underline"
    //               >
    //                 <Mail size={16} />
    //                 {listing.contactEmail}
    //               </a>
    //             )}
    //           </div>
    //         </div>
    //       </div>
    //     </>
    //   )}
    // </div>
    <div className="px-4 py-12 bg-primary/5">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <LocateFixed className="size-8 text-primary" />
              <p className="text-sm text-muted-foreground">
                {listing.street}, {listing.streetNumber} - {listing.district},{" "}
                {listing.city} - {listing.state}
              </p>
            </div>
            <h3 className="text-3xl font-bold">{listing.title}</h3>
          </div>

          <div className="space-y-1 text-right">
            <p className="text-sm text-muted-foreground">Valor de venda</p>
            <p className="text-2xl font-bold text-primary">
              R$ {listing.price.toLocaleString("pt-BR")}
            </p>
            <p className="text-sm text-muted-foreground">
              Condomínio: R$ {listing.condominiumFee} / mês
            </p>
            <p className="text-sm text-muted-foreground">
              IPTU: R$ {listing.iptuYearly} / ano
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6 mt-8">
          <div>
            <Image
              src="/images/house.jpg"
              alt="Imagem do imóvel"
              width={600}
              height={600}
              className="rounded-lg object-cover w-full h-[600px]"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6">
            <div>
              <Image
                src="/images/house.jpg"
                alt="Imagem do imóvel"
                width={600}
                height={350}
                className="rounded-lg object-cover w-full h-full"
              />
            </div>
            <div>
              <Image
                src="/images/house.jpg"
                alt="Imagem do imóvel"
                width={600}
                height={350}
                className="rounded-lg object-cover w-full h-full"
              />
            </div>
            <div>
              <Image
                src="/images/house.jpg"
                alt="Imagem do imóvel"
                width={600}
                height={350}
                className="rounded-lg object-cover w-full h-full"
              />
            </div>
            <div>
              <Image
                src="/images/house.jpg"
                alt="Imagem do imóvel"
                width={600}
                height={350}
                className="rounded-lg object-cover w-full h-full"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] lg:grid-cols-[2fr_1fr] gap-6 mt-8">
          <div className="w-full p-8 h-24 mt-4 s rounded-lg bg-white gap-4">
            Teste
          </div>
          <div className="w-full p-8 h-24 mt-4 s rounded-lg bg-white gap-4">
            Teste
          </div>
        </div>

        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mt-8">
          <div className="w-full p-8 h-24 mt-8 s rounded-lg bg-white gap-4">
            <Comodities
              icon={<LandPlot size={22} className="text-primary" />}
              title="Área total"
              label={`${listing.areaM2} m²`}
            />
            <Comodities
              icon={<LandPlot size={22} className="text-primary" />}
              title="Data de construção"
              label={`${listing.yearBuilt}`}
            />
            {listing.type === "APARTMENT" && (
              <>
                <Comodities
                  icon={<Warehouse size={22} className="text-primary" />}
                  label={`${listing.floor === null ? "N/A" : `${listing.floor} andar(es)`}`}
                />
                <Comodities
                  icon={<Warehouse size={22} className="text-primary" />}
                  label={`${listing.totalFloors === null ? "N/A" : `${listing.totalFloors} andar(es)`}`}
                />
                <Comodities
                  icon={<Warehouse size={22} className="text-primary" />}
                  label={`${listing.petFriendly === null ? "N/A" : `${listing.petFriendly ? "Permitido" : "Não permitido"}`}`}
                />
              </>
            )}
            <Comodities
              icon={<Blocks size={22} className="text-primary" />}
              title="Área construída"
              label={`${listing.builtArea === null ? "N/A" : `${listing.builtArea} m²`}`}
            />
            <Comodities
              icon={<Bed size={22} className="text-primary" />}
              title="Quarto(s)"
              label={`${listing.bedrooms === null ? "N/A" : `${listing.bedrooms}`}`}
            />
            <Comodities
              icon={<Bath size={22} className="text-primary" />}
              title="Banheiro(s)"
              label={`${listing.bathrooms === null ? "N/A" : `${listing.bathrooms}`}`}
            />
            <Comodities
              icon={<Warehouse size={22} className="text-primary" />}
              title="Vaga(s)"
              label={`${listing.garageSpots === null ? "N/A" : `${listing.garageSpots}`}`}
            />
          </div>

          <div className="w-full p-8 h-24 mt-4 s rounded-lg bg-white gap-4">
            <Comodities
              icon={<ArrowRightLeft size={22} className="text-primary" />}
              title="Aceita troca"
              label={`${listing.acceptsExchange === false ? "Não" : "Sim"}`}
            />
            <Comodities
              icon={<DollarSign size={22} className="text-primary" />}
              title="Aceita financiamento"
              label={`${listing.acceptsFinancing === false ? "Não" : "Sim"}`}
            />
            <Comodities
              icon={<CarFront size={22} className="text-primary" />}
              title="Aceita veículo na troca"
              label={`${listing.acceptsCarTrade === false ? "Não" : "Sim"}`}
            />
            <Comodities
              icon={<CalendarSync size={22} className="text-primary" />}
              title="Lançamento"
              label={`${listing.isLaunch === false ? "Não" : "Sim"}`}
            />
            <Comodities
              icon={<Rocket size={22} className="text-primary" />}
              title="Pronto para morar"
              label={`${listing.isReadyToMove === false ? "Não" : "Sim"}`}
            />
          </div>
        </div>

        <div className="w-full flex items-center justify-between p-8 h-24 mt-4 s rounded-lg bg-white gap-4">
          <div>Test</div>
        </div> */}
      </div>
    </div>
  );
};
