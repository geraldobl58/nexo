"use client";

import { useEffect, useCallback, useRef, useState, DragEvent } from "react";
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
import PhotoLibraryOutlinedIcon from "@mui/icons-material/PhotoLibraryOutlined";

import { FormField } from "@/components/ui/form-field/form-field";
import { SelectControl } from "@/components/ui/select-control/select-control";
import { CurrencyField } from "@/components/ui/currency-field/currency-field";
import { CheckboxCustom } from "@/components/ui/checkbox-custom/checkbox-custom";
import { LeafletMap } from "@/lib/leaflet-map";
import { DEFAULT_LAT, DEFAULT_LNG, fetchCep } from "@/lib/fect-cep";

import { useMyListingById, useUpdateMyListing } from "../hooks/use-my-listings";
import { useListMedia } from "../hooks/use-media";
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
import { MediaItem, UpdateListingInput } from "../types/publish-types";
import { MyPropertyMediaCard } from "./my-property-media-card";
import { deleteMedia, reorderMedia, uploadMedia } from "../http/publish";

import {
  ACCEPTED_EXTENSIONS,
  ACCEPTED_TYPES,
  MAX_IMAGES_FREE,
  MAX_IMAGES_PAID,
  MAX_VIDEOS,
  validateFile,
} from "@/lib/media-upload";
import { fromCents } from "@/lib/formatted-money";
import { MediaSlot } from "../types/my-property-media-card";
import { CURRENT_PLAN_MAX_IMAGES } from "@/constants";

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
  const {
    listing,
    isLoading,
    isPending: isListingPending,
    error,
  } = useMyListingById(id);
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

  // ── Media (fotos/vídeos existentes) ──────────────────────────────────────

  const { data: existingMedia, refetch: refetchMedia } = useListMedia(id);

  // Slots unificados: existentes (MediaItem) + novos (File aguardando upload)
  const [slots, setSlots] = useState<MediaSlot[]>([]);
  // IDs das mídias existentes que foram removidas e devem ser deletadas ao salvar
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  // Controla se os slots já foram inicializados com os dados da query
  const [mediaInitialized, setMediaInitialized] = useState(false);
  const [photoSaving, setPhotoSaving] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  // Ref para evitar stale closure no drag-and-drop entre cards
  const draggingIndexRef = useRef<number | null>(null);

  // Inicializa (ou reinicializa após salvar) os slots com as mídias do servidor
  useEffect(() => {
    if (existingMedia && !mediaInitialized) {
      setSlots(
        [...existingMedia]
          .sort((a, b) => a.order - b.order)
          .map((item) => ({ kind: "existing" as const, item })),
      );
      setMediaInitialized(true);
    }
  }, [existingMedia, mediaInitialized]);

  const imageCount = slots.filter((s) =>
    s.kind === "existing"
      ? s.item.type === "IMAGE"
      : ACCEPTED_TYPES[s.file.type] === "IMAGE",
  ).length;
  const videoCount = slots.filter((s) =>
    s.kind === "existing"
      ? s.item.type === "VIDEO"
      : ACCEPTED_TYPES[s.file.type] === "VIDEO",
  ).length;

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const newErrors: string[] = [];
      const toAdd: File[] = [];

      let imgs = imageCount;
      let vids = videoCount;

      Array.from(incoming).forEach((file) => {
        const error = validateFile(file, imgs, vids, CURRENT_PLAN_MAX_IMAGES);
        if (error) {
          newErrors.push(error);
          return;
        }
        toAdd.push(file);
        if (ACCEPTED_TYPES[file.type] === "IMAGE") imgs++;
        else vids++;
      });

      setErrors(newErrors);
      if (toAdd.length > 0) {
        setSlots((prev) => [
          ...prev,
          ...toAdd.map((file) => ({
            kind: "new" as const,
            file,
            tempId: crypto.randomUUID(),
          })),
        ]);
      }
    },
    [imageCount, videoCount],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) addFiles(e.target.files);
      // Reset input para permitir selecionar o mesmo arquivo novamente
      e.target.value = "";
    },
    [addFiles],
  );

  const handleRemove = useCallback((index: number) => {
    setSlots((prev) => {
      const slot = prev[index];
      if (slot.kind === "existing") {
        setRemovedIds((ids) => [...ids, slot.item.id]);
      }
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  // ── Drag-and-drop entre cards (reordenação) ────────────────────────────

  const handleCardDragStart = useCallback(
    (index: number, e: DragEvent<HTMLDivElement>) => {
      draggingIndexRef.current = index;
      // Necessário para que o evento dragover/drop funcione no Firefox
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(index));
    },
    [],
  );

  const handleCardDragOver = useCallback(
    (index: number, e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation(); // não aciona o dropzone de arquivos
      e.dataTransfer.dropEffect = "move";
      setDragOverIndex(index);
    },
    [],
  );

  const handleCardDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleCardDrop = useCallback(
    (toIndex: number, e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation(); // não aciona o dropzone de arquivos
      const fromIndex = draggingIndexRef.current;
      if (fromIndex !== null && fromIndex !== toIndex) {
        setSlots((prev) => {
          const next = [...prev];
          const [moved] = next.splice(fromIndex, 1);
          next.splice(toIndex, 0, moved);
          return next;
        });
      }
      draggingIndexRef.current = null;
      setDragOverIndex(null);
    },
    [],
  );

  const handleCardDragEnd = useCallback(() => {
    draggingIndexRef.current = null;
    setDragOverIndex(null);
  }, []);

  // ── Drag-and-drop da zona de upload (adicionar arquivos) ───────────────

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  // ── Submit — dados do imóvel ──────────────────────────────────────────────

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

  // ── Submit — fotos ────────────────────────────────────────────────────────

  async function handleSavePhotos() {
    setPhotoSaving(true);
    try {
      // 1. Deletar mídias removidas (ignora 404 — já pode ter sido deletada
      //    em uma tentativa anterior que falhou após o delete)
      for (const mediaId of removedIds) {
        try {
          await deleteMedia(id, mediaId);
        } catch (err: unknown) {
          const status = (err as { response?: { status?: number } })?.response
            ?.status;
          if (status !== 404) throw err;
        }
      }

      // 2. Fazer upload dos arquivos novos
      const uploadedSlots: Array<{ tempId: string; item: MediaItem }> = [];
      for (const slot of slots) {
        if (slot.kind === "new") {
          const item = await uploadMedia(id, slot.file);
          uploadedSlots.push({ tempId: slot.tempId, item });
        }
      }

      // 3. Montar lista final na ordem atual e reordenar no backend
      const finalItems: MediaItem[] = slots
        .map((slot) => {
          if (slot.kind === "existing") return slot.item;
          return (
            uploadedSlots.find((u) => u.tempId === slot.tempId)?.item ?? null
          );
        })
        .filter((item): item is MediaItem => item !== null);

      if (finalItems.length > 0) {
        await reorderMedia(
          id,
          finalItems.map((item, i) => ({ id: item.id, order: i })),
        );
      }

      // 4. Reinicializar o estado a partir dos dados frescos do servidor
      const { data: freshMedia } = await refetchMedia();
      setRemovedIds([]);
      if (freshMedia) {
        setSlots(
          [...freshMedia]
            .sort((a, b) => a.order - b.order)
            .map((item) => ({ kind: "existing" as const, item })),
        );
        setMediaInitialized(true);
      }

      setSaveMessage({ type: "success", text: "Fotos salvas com sucesso!" });
      setTimeout(() => setSaveMessage(null), 4000);
    } catch {
      setSaveMessage({
        type: "error",
        text: "Erro ao salvar as fotos. Tente novamente.",
      });
      setTimeout(() => setSaveMessage(null), 4000);
    } finally {
      setPhotoSaving(false);
    }
  }

  // ── Loading / Error ───────────────────────────────────────────────────────

  if (isLoading || isListingPending) {
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
        {activeTab !== 3 && (
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
        )}
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
          <Tab label="Fotos" />
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

      {/* ── Tab 3: Fotos ───────────────────────────────────────────────── */}
      <TabPanel value={activeTab} index={3}>
        <div className="flex flex-col w-full px-4 py-4 rounded-lg space-y-6 mt-4 shadow-md bg-white">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-2xl font-bold">Fotos e vídeos do imóvel</h3>
            <Button
              variant="outlined"
              disabled={photoSaving}
              onClick={handleSavePhotos}
              startIcon={
                photoSaving ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <PhotoLibraryOutlinedIcon />
                )
              }
            >
              {photoSaving ? "Salvando fotos..." : "Salvar fotos"}
            </Button>
          </div>

          {/* Badge de limite por plano */}
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-0.5 text-xs font-semibold text-amber-800">
              Plano FREE — até {MAX_IMAGES_FREE} fotos
            </span>
            <span className="text-xs text-gray-400">
              Planos pagos permitem até {MAX_IMAGES_PAID} fotos
            </span>
          </div>

          <p className="text-sm text-gray-500">
            A primeira imagem será usada como capa do anúncio. Arraste os cards
            para reordenar. Clique em <strong>Salvar fotos</strong> para aplicar
            as alterações.
          </p>

          {/* Contador */}
          <div className="flex gap-4 text-sm text-gray-600">
            <span>
              📷 <strong>{imageCount}</strong>/{CURRENT_PLAN_MAX_IMAGES} fotos
            </span>
            <span>
              🎥 <strong>{videoCount}</strong>/{MAX_VIDEOS} vídeos
            </span>
            {removedIds.length > 0 && (
              <span className="text-amber-600">
                ⚠️ {removedIds.length} foto(s) pendente(s) de exclusão
              </span>
            )}
            {slots.some((s) => s.kind === "new") && (
              <span className="text-green-600">
                ✅ {slots.filter((s) => s.kind === "new").length} nova(s) para
                enviar
              </span>
            )}
          </div>

          {/* Dropzone */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Clique ou arraste arquivos aqui"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <div className="text-center">
              <p className="font-medium text-gray-700">
                Clique para selecionar ou arraste os arquivos aqui
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Fotos: JPEG, PNG, WebP — máx. 10 MB cada — até{" "}
                {CURRENT_PLAN_MAX_IMAGES} no plano atual &nbsp;|&nbsp; Vídeos:
                MP4, MOV — máx. 100 MB cada
              </p>
            </div>

            <input
              ref={inputRef}
              type="file"
              multiple
              accept={ACCEPTED_EXTENSIONS}
              className="hidden"
              onChange={handleInputChange}
            />
          </div>

          {/* Erros de validação */}
          {errors.length > 0 && (
            <ul className="space-y-1">
              {errors.map((err, i) => (
                <li
                  key={i}
                  className="text-sm text-red-600 flex items-start gap-1"
                >
                  <span>⚠️</span> {err}
                </li>
              ))}
            </ul>
          )}

          {/* Grid de prévias */}
          {slots.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {slots.map((slot, index) => (
                <MyPropertyMediaCard
                  key={
                    slot.kind === "existing"
                      ? slot.item.id
                      : `new-${slot.tempId}`
                  }
                  slot={slot}
                  index={index}
                  onRemove={handleRemove}
                  isDragOver={dragOverIndex === index}
                  onDragStart={(e) => handleCardDragStart(index, e)}
                  onDragOver={(e) => handleCardDragOver(index, e)}
                  onDragLeave={handleCardDragLeave}
                  onDrop={(e) => handleCardDrop(index, e)}
                  onDragEnd={handleCardDragEnd}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-gray-400 py-4">
              Nenhuma foto adicionada ainda.
            </p>
          )}
        </div>
      </TabPanel>

      {/* ── Tab 4: Contato ───────────────────────────────────────────────── */}
      <TabPanel value={activeTab} index={4}>
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
