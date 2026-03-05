"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PatternFormat } from "react-number-format";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  LinearProgress,
  Tab,
  Tabs,
  TextField,
} from "@mui/material";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

import { FormField } from "@/components/ui/form-field/form-field";
import { SelectControl } from "@/components/ui/select-control/select-control";
import { CurrencyField } from "@/components/ui/currency-field/currency-field";
import { CheckboxCustom } from "@/components/ui/checkbox-custom/checkbox-custom";
import { LeafletMap } from "@/lib/leaflet-map";
import { DEFAULT_LAT, DEFAULT_LNG, fetchCep } from "@/lib/fect-cep";

import { useMyListingById, useUpdateMyListing } from "../hooks/use-my-listings";
import {
  createPublishLocationSchema,
  PublishLocationData,
} from "../schemas/publish-location";
import { createPushlishDetailsSchema } from "../schemas/publish-details";
import { CreatePublishDetailsData } from "../types/publish-details-types";
import {
  createPublishComoditiesSchema,
  PublishComoditiesData,
} from "../schemas/publish-comodities";
import {
  createPushlishContactSchema,
  PublishContactData,
} from "../schemas/publish-contact";
import { Purpose, PropertyType } from "../enums/publish-details-enums";
import { UpdateListingInput } from "../types/publish-types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type MyPropertyProps = {
  params: {
    "my-property": string;
  };
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Converte centavos → reais para exibição no formulário. */
function fromCents(value: number | null | undefined): number | undefined {
  if (value == null) return undefined;
  return value / 100;
}

function TabPanel({
  children,
  value,
  index,
}: {
  children: React.ReactNode;
  value: number;
  index: number;
}) {
  return value === index ? <>{children}</> : null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const MyProperty = ({ params }: MyPropertyProps) => {
  const id = params["my-property"];
  const { listing, isLoading, error } = useMyListingById(id);
  const { mutateAsync: doUpdate, isPending } = useUpdateMyListing();

  const [activeTab, setActiveTab] = useState(0);
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // ── Form: Detalhes ────────────────────────────────────────────────────────

  const detailsForm = useForm<CreatePublishDetailsData>({
    resolver: zodResolver(createPushlishDetailsSchema),
    mode: "onChange",
    defaultValues: {
      purpose: "" as Purpose,
      type: "" as PropertyType,
      title: "",
      description: "",
      price: undefined,
      condominiumFee: undefined,
      iptuYearly: undefined,
    },
  });

  // ── Form: Localização ─────────────────────────────────────────────────────

  const locationForm = useForm<PublishLocationData>({
    resolver: zodResolver(createPublishLocationSchema),
    mode: "onChange",
    defaultValues: {
      zipcode: "",
      street: "",
      streetNumber: "",
      district: "",
      complement: "",
      city: "",
      state: "",
      latitude: undefined,
      longitude: undefined,
    },
  });

  // ── Form: Comodidades ─────────────────────────────────────────────────────

  const comoditiesForm = useForm<PublishComoditiesData>({
    resolver: zodResolver(createPublishComoditiesSchema),
    mode: "onChange",
    defaultValues: {},
  });

  // ── Form: Contato ─────────────────────────────────────────────────────────

  const contactForm = useForm<PublishContactData>({
    resolver: zodResolver(createPushlishContactSchema),
    mode: "onChange",
    defaultValues: {
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      contactWhatsApp: "",
    },
  });

  // ── Pre-fill uma vez que o listing carregar ────────────────────────────────

  useEffect(() => {
    if (!listing) return;

    detailsForm.reset({
      purpose: (listing.purpose as Purpose) ?? ("" as Purpose),
      type: (listing.type as PropertyType) ?? ("" as PropertyType),
      title: listing.title ?? "",
      description: listing.description ?? "",
      price: fromCents(listing.price),
      condominiumFee: fromCents(listing.condominiumFee ?? undefined),
      iptuYearly: fromCents(listing.iptuYearly ?? undefined),
    });

    locationForm.reset({
      zipcode: listing.zipcode ?? "",
      street: listing.street ?? "",
      streetNumber: listing.streetNumber ?? "",
      district: listing.district ?? "",
      complement: listing.complement ?? "",
      city: listing.city ?? "",
      state: listing.state ?? "",
      latitude: listing.latitude ?? undefined,
      longitude: listing.longitude ?? undefined,
    });

    comoditiesForm.reset({
      areaM2: listing.areaM2 ?? undefined,
      builtArea: listing.builtArea ?? undefined,
      bedrooms: listing.bedrooms ?? undefined,
      suites: listing.suites ?? undefined,
      bathrooms: listing.bathrooms ?? undefined,
      garageSpots: listing.garageSpots ?? undefined,
      floor: listing.floor ?? undefined,
      totalFloors: listing.totalFloors ?? undefined,
      yearBuilt: listing.yearBuilt ?? undefined,
      furnished: listing.furnished ?? undefined,
      petFriendly: listing.petFriendly ?? undefined,
      acceptsExchange: listing.acceptsExchange ?? undefined,
      acceptsFinancing: listing.acceptsFinancing ?? undefined,
      acceptsCarTrade: listing.acceptsCarTrade ?? undefined,
      isLaunch: listing.isLaunch ?? undefined,
      isReadyToMove: listing.isReadyToMove ?? undefined,
    });

    contactForm.reset({
      contactName: listing.contactName ?? "",
      contactEmail: listing.contactEmail ?? "",
      contactPhone: listing.contactPhone ?? "",
      contactWhatsApp: listing.contactWhatsApp ?? "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listing]);

  // ── Mapa / busca de CEP ───────────────────────────────────────────────────

  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: DEFAULT_LAT,
    lng: DEFAULT_LNG,
  });
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (listing?.latitude && listing?.longitude) {
      setCoords({ lat: listing.latitude, lng: listing.longitude });
    }
  }, [listing]);

  const zipcode = useWatch({ control: locationForm.control, name: "zipcode" });

  useEffect(() => {
    const digits = zipcode?.replace(/\D/g, "") ?? "";
    if (digits.length !== 8) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setCepLoading(true);
      setCepError(null);

      const data = await fetchCep(digits);
      if (!data) {
        setCepError("CEP não encontrado.");
        setCepLoading(false);
        return;
      }

      locationForm.setValue("street", data.logradouro, {
        shouldValidate: true,
      });
      locationForm.setValue("district", data.bairro, { shouldValidate: true });
      locationForm.setValue("city", data.localidade, { shouldValidate: true });
      locationForm.setValue("state", data.uf, { shouldValidate: true });

      if (data.lat && data.lng) {
        locationForm.setValue("latitude", data.lat);
        locationForm.setValue("longitude", data.lng);
        setCoords({ lat: data.lat, lng: data.lng });
      }

      setCepLoading(false);
    }, 600);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [zipcode, locationForm]);

  // ── Submit ────────────────────────────────────────────────────────────────

  async function handleSave() {
    const details = detailsForm.getValues();
    const location = locationForm.getValues();
    const comodities = comoditiesForm.getValues();
    const contact = contactForm.getValues();

    const payload: UpdateListingInput = {
      ...location,
      ...details,
      ...comodities,
      ...contact,
    };

    const result = await doUpdate({ id, input: payload });
    const msg = result.success
      ? { type: "success" as const, text: result.message }
      : { type: "error" as const, text: result.message };

    setSaveMessage(msg);
    setTimeout(() => setSaveMessage(null), 4000);
  }

  // ── Loading / Error ───────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <CircularProgress />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <Alert severity="error" className="m-4">
        Não foi possível carregar o imóvel.
      </Alert>
    );
  }

  const {
    control: dControl,
    formState: { errors: dErrors },
  } = detailsForm;
  const {
    control: lControl,
    formState: { errors: lErrors },
  } = locationForm;
  const {
    control: cControl,
    formState: { errors: cErrors },
  } = comoditiesForm;
  const {
    control: ctControl,
    formState: { errors: ctErrors },
  } = contactForm;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold truncate">{listing.title}</h2>
        <Button
          variant="contained"
          disabled={isPending}
          onClick={handleSave}
          startIcon={
            isPending ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <SaveOutlinedIcon />
            )
          }
        >
          {isPending ? "Salvando..." : "Salvar alterações"}
        </Button>
      </div>

      {saveMessage && (
        <Alert severity={saveMessage.type} onClose={() => setSaveMessage(null)}>
          {saveMessage.text}
        </Alert>
      )}

      {/* Navegação por abas */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab label="Detalhes" />
          <Tab label="Localização" />
          <Tab label="Comodidades" />
          <Tab label="Contato" />
        </Tabs>
      </Box>

      {/* ── Tab 0: Detalhes ──────────────────────────────────────────────── */}
      <TabPanel value={activeTab} index={0}>
        <div className="flex flex-col w-full px-4 py-4 rounded-lg space-y-8 mt-4 shadow-md bg-white">
          <h3 className="text-2xl font-bold">Detalhes do imóvel</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <SelectControl
              control={dControl}
              name="purpose"
              label="Finalidade"
              options={[
                { value: Purpose.SALE, label: "Venda" },
                { value: Purpose.RENT, label: "Aluguel" },
              ]}
              error={!!dErrors.purpose?.message}
            />
            <SelectControl
              control={dControl}
              name="type"
              label="Tipo de Imóvel"
              options={[
                { value: PropertyType.APARTMENT, label: "Apartamento" },
                { value: PropertyType.HOUSE, label: "Casa" },
                { value: PropertyType.CONDO_HOUSE, label: "Condomínio" },
                { value: PropertyType.STUDIO, label: "Kitnet/Studio" },
                { value: PropertyType.LAND, label: "Terreno" },
                { value: PropertyType.COMMERCIAL, label: "Comercial" },
                { value: PropertyType.FARM, label: "Sítio/Fazenda" },
                { value: PropertyType.OTHER, label: "Outro" },
              ]}
              error={!!dErrors.type?.message}
            />
          </div>

          <div className="w-full">
            <FormField
              control={dControl}
              name="title"
              label="Título do anúncio"
              type="text"
              error={!!dErrors.title?.message}
            />
          </div>

          <div className="w-full">
            <FormField
              control={dControl}
              name="description"
              label="Descrição do anúncio"
              type="text"
              rows={10}
              multiline
              error={!!dErrors.description?.message}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            <CurrencyField
              control={dControl}
              name="price"
              label="Preço"
              error={!!dErrors.price?.message}
            />
            <CurrencyField
              control={dControl}
              name="condominiumFee"
              label="Condomínio (opcional)"
              error={!!dErrors.condominiumFee?.message}
            />
            <CurrencyField
              control={dControl}
              name="iptuYearly"
              label="IPTU (anual, opcional)"
              error={!!dErrors.iptuYearly?.message}
            />
          </div>
        </div>
      </TabPanel>

      {/* ── Tab 1: Localização ───────────────────────────────────────────── */}
      <TabPanel value={activeTab} index={1}>
        <div className="flex flex-col w-full px-4 py-4 rounded-lg space-y-8 mt-4 shadow-md bg-white">
          <h3 className="text-2xl font-bold">Localização do imóvel</h3>

          <div className="w-full">
            <Controller
              control={lControl}
              name="zipcode"
              render={({ field: { onChange, value, ref } }) => (
                <PatternFormat
                  format="#####-###"
                  mask="_"
                  value={value}
                  onValueChange={(values) => onChange(values.value)}
                  customInput={TextField}
                  fullWidth
                  label="CEP"
                  inputRef={ref}
                  error={!!lErrors.zipcode?.message}
                  helperText={lErrors.zipcode?.message}
                  inputMode="numeric"
                />
              )}
            />
            {cepLoading && (
              <div className="mt-2">
                <LinearProgress />
              </div>
            )}
            {cepError && (
              <p className="text-xs text-red-500 mt-1">{cepError}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            <FormField
              control={lControl}
              name="street"
              label="Rua"
              type="text"
              disabled
              error={!!lErrors.street?.message}
            />
            <FormField
              control={lControl}
              name="streetNumber"
              label="Número"
              type="text"
              error={!!lErrors.streetNumber?.message}
            />
            <FormField
              control={lControl}
              name="complement"
              label="Complemento"
              type="text"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            <FormField
              control={lControl}
              name="district"
              label="Bairro"
              type="text"
              disabled
              error={!!lErrors.district?.message}
            />
            <FormField
              control={lControl}
              name="city"
              label="Cidade"
              type="text"
              disabled
              error={!!lErrors.city?.message}
            />
            <FormField
              control={lControl}
              name="state"
              label="Estado"
              type="text"
              disabled
              error={!!lErrors.state?.message}
            />
          </div>

          <div className="w-full rounded-lg overflow-hidden">
            <LeafletMap lat={coords.lat} lng={coords.lng} height="400px" />
          </div>
        </div>
      </TabPanel>

      {/* ── Tab 2: Comodidades ───────────────────────────────────────────── */}
      <TabPanel value={activeTab} index={2}>
        <div className="flex flex-col w-full px-4 py-4 rounded-lg space-y-8 mt-4 shadow-md bg-white">
          <h3 className="text-2xl font-bold">Comodidades do imóvel</h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
            <FormField
              control={cControl}
              name="areaM2"
              label="Área (m²)"
              type="number"
              required
              error={!!cErrors.areaM2?.message}
            />
            <FormField
              control={cControl}
              name="builtArea"
              label="Área construída (m²)"
              type="number"
              error={!!cErrors.builtArea?.message}
            />
            <FormField
              control={cControl}
              name="bedrooms"
              label="Quartos"
              type="number"
              required
              error={!!cErrors.bedrooms?.message}
            />
            <FormField
              control={cControl}
              name="suites"
              label="Suítes"
              type="number"
              error={!!cErrors.suites?.message}
            />
            <FormField
              control={cControl}
              name="bathrooms"
              label="Banheiros"
              type="number"
              required
              error={!!cErrors.bathrooms?.message}
            />
            <FormField
              control={cControl}
              name="garageSpots"
              label="Vagas de garagem"
              type="number"
              error={!!cErrors.garageSpots?.message}
            />
            <FormField
              control={cControl}
              name="floor"
              label="Andar"
              type="number"
              error={!!cErrors.floor?.message}
            />
            <FormField
              control={cControl}
              name="totalFloors"
              label="Total de Andares"
              type="number"
              error={!!cErrors.totalFloors?.message}
            />
            <FormField
              control={cControl}
              name="yearBuilt"
              label="Ano de construção"
              type="number"
              error={!!cErrors.yearBuilt?.message}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            <CheckboxCustom
              control={cControl}
              name="furnished"
              label="Mobiliado"
              helperText={cErrors.furnished?.message}
            />
            <CheckboxCustom
              control={cControl}
              name="petFriendly"
              label="Aceita animais"
              helperText={cErrors.petFriendly?.message}
            />
            <CheckboxCustom
              control={cControl}
              name="acceptsExchange"
              label="Aceita troca"
              helperText={cErrors.acceptsExchange?.message}
            />
            <CheckboxCustom
              control={cControl}
              name="acceptsFinancing"
              label="Aceita financiamento"
              helperText={cErrors.acceptsFinancing?.message}
            />
            <CheckboxCustom
              control={cControl}
              name="acceptsCarTrade"
              label="Aceita veículo na troca"
              helperText={cErrors.acceptsCarTrade?.message}
            />
            <CheckboxCustom
              control={cControl}
              name="isLaunch"
              label="Lançamento"
              helperText={cErrors.isLaunch?.message}
            />
            <CheckboxCustom
              control={cControl}
              name="isReadyToMove"
              label="Pronto para morar"
              helperText={cErrors.isReadyToMove?.message}
            />
          </div>
        </div>
      </TabPanel>

      {/* ── Tab 3: Contato ───────────────────────────────────────────────── */}
      <TabPanel value={activeTab} index={3}>
        <div className="flex flex-col w-full px-4 py-4 rounded-lg space-y-8 mt-4 shadow-md bg-white">
          <h3 className="text-2xl font-bold">Dados de contato</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <FormField
              control={ctControl}
              name="contactName"
              label="Nome de contato"
              type="text"
              required
              error={!!ctErrors.contactName?.message}
            />
            <FormField
              control={ctControl}
              name="contactEmail"
              label="Email de contato"
              type="email"
              required
              error={!!ctErrors.contactEmail?.message}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <FormField
              control={ctControl}
              name="contactPhone"
              label="Telefone de contato"
              type="text"
              required
              error={!!ctErrors.contactPhone?.message}
            />
            <FormField
              control={ctControl}
              name="contactWhatsApp"
              label="WhatsApp de contato"
              type="text"
              required
              error={!!ctErrors.contactWhatsApp?.message}
            />
          </div>
        </div>
      </TabPanel>
    </div>
  );
};
