"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller } from "react-hook-form";

import { PatternFormat } from "react-number-format";

import {
  createPublishLocationSchema,
  PublishLocationData,
} from "../../schemas/publish-location";
import { FormField } from "@/components/ui/form-field/form-field";
import { usePublish } from "@/contexts/publish-context";
import { LinearProgress, TextField } from "@mui/material";
import { StepLocationProps } from "../../types/publish-location-types";
import { DEFAULT_LAT, DEFAULT_LNG, fetchCep } from "@/lib/fect-cep";
import { LeafletMap } from "@/lib/leaflet-map";

export const StepLocation = ({ onValidChange }: StepLocationProps) => {
  const { formData, setLocationData, setLocationValid } = usePublish();

  const {
    control,
    setValue,
    formState: { errors, isValid },
  } = useForm<PublishLocationData>({
    resolver: zodResolver(createPublishLocationSchema),
    mode: "onChange",
    // Restaura os dados salvos no context ao voltar para este step
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
      ...formData.location,
    },
  });

  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: DEFAULT_LAT,
    lng: DEFAULT_LNG,
  });
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sincroniza validade com o context e com o callback opcional do pai
  useEffect(() => {
    setLocationValid(isValid);
    onValidChange?.(isValid);
  }, [isValid, setLocationValid, onValidChange]);

  // Observa o campo de CEP
  const zipcode = useWatch({ control, name: "zipcode" });

  // Persiste qualquer mudança nos campos no context
  const allValues = useWatch({ control });
  useEffect(() => {
    setLocationData(allValues as Partial<PublishLocationData>);
  }, [allValues, setLocationData]);

  // Restaura coordenadas salvas no context ao voltar para este step
  useEffect(() => {
    const { latitude, longitude } = formData.location;
    if (latitude && longitude) {
      setCoords({ lat: latitude, lng: longitude });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      // Preenche os campos automaticamente
      setValue("street", data.logradouro, { shouldValidate: true });
      setValue("district", data.bairro, { shouldValidate: true });
      setValue("city", data.localidade, { shouldValidate: true });
      setValue("state", data.uf, { shouldValidate: true });

      // BrasilAPI já retorna as coordenadas — sem chamada extra de geocoding
      if (data.lat && data.lng) {
        setValue("latitude", data.lat);
        setValue("longitude", data.lng);
        setCoords({ lat: data.lat, lng: data.lng });
      }

      setCepLoading(false);
    }, 600);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [zipcode, setValue]);

  return (
    <div className="flex flex-col w-full px-4 py-4 rounded-lg space-y-8 mt-10 shadow-md bg-white">
      <h3 className="text-2xl font-bold">Localização do imóvel</h3>

      <div className="w-full">
        <Controller
          control={control}
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
              error={!!errors.zipcode?.message}
              helperText={errors.zipcode?.message}
              inputMode="numeric"
            />
          )}
        />
        {cepLoading && (
          <div className="mt-2 text-sm text-gray-500">
            <LinearProgress />
          </div>
        )}
        {cepError && <p className="text-xs text-red-500 mt-1">{cepError}</p>}
      </div>
      {/* Número + Complemento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        <FormField
          control={control}
          name="street"
          label="Rua"
          type="text"
          disabled={true}
          error={!!errors.street?.message}
        />
        <FormField
          control={control}
          name="streetNumber"
          label="Número"
          type="text"
          error={!!errors.streetNumber?.message}
        />
        <FormField
          control={control}
          name="complement"
          label="Complemento"
          type="text"
        />
      </div>

      {/* Bairro + (preenchido automaticamente) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        <FormField
          control={control}
          name="district"
          label="Bairro"
          type="text"
          disabled={true}
          error={!!errors.district?.message}
        />
        <FormField
          control={control}
          name="city"
          label="Cidade"
          type="text"
          disabled={true}
          error={!!errors.city?.message}
        />
        <FormField
          control={control}
          name="state"
          label="Estado"
          type="text"
          disabled={true}
          error={!!errors.state?.message}
        />
      </div>

      {/* Mapa */}
      <div className="w-full rounded-lg overflow-hidden">
        <LeafletMap lat={coords.lat} lng={coords.lng} height="400px" />
      </div>
    </div>
  );
};
