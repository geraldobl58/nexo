"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { usePublish } from "../context/publish-context";
import {
  createPublishComoditiesSchema,
  PublishComoditiesData,
} from "../schemas/publish-comodities";
import { FormField } from "@/components/ui/form-field/form-field";
import { CheckboxCustom } from "@/components/ui/checkbox-custom/checkbox-custom";

export const StepComodities = () => {
  const { formData, setComoditiesData, setComoditiesValid } = usePublish();

  const {
    control,
    formState: { errors, isValid },
  } = useForm<PublishComoditiesData>({
    resolver: zodResolver(createPublishComoditiesSchema),
    mode: "onChange",
    defaultValues: {
      ...formData.comodities,
    },
  });

  // Sincroniza validade com o context
  useEffect(() => {
    setComoditiesValid(isValid);
  }, [isValid, setComoditiesValid]);

  // Persiste alterações dos campos no context
  const allValues = useWatch({ control });
  useEffect(() => {
    setComoditiesData(allValues as Partial<PublishComoditiesData>);
  }, [allValues, setComoditiesData]);

  return (
    <div className="flex flex-col w-full px-4 py-4 rounded-lg space-y-8 mt-10 shadow-md bg-white">
      <h3 className="text-2xl font-bold">Comodidades do imóvel</h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
        <FormField
          control={control}
          name="areaM2"
          label="Área (m²)"
          type="number"
          required
          error={!!errors.areaM2?.message}
        />
        <FormField
          control={control}
          name="builtArea"
          label="Área construída (m²)"
          type="number"
          error={!!errors.builtArea?.message}
        />
        <FormField
          control={control}
          name="bedrooms"
          label="Quartos"
          type="number"
          required
          error={!!errors.bedrooms?.message}
        />
        <FormField
          control={control}
          name="suites"
          label="Suítes"
          type="number"
          error={!!errors.suites?.message}
        />
        <FormField
          control={control}
          name="bathrooms"
          label="Banheiros"
          type="number"
          required
          error={!!errors.bathrooms?.message}
        />
        <FormField
          control={control}
          name="garageSpots"
          label="Vagas de garagem"
          type="number"
          error={!!errors.garageSpots?.message}
        />
        <FormField
          control={control}
          name="floor"
          label="Andar"
          type="number"
          error={!!errors.floor?.message}
        />
        <FormField
          control={control}
          name="totalFloors"
          label="Total de Andares"
          type="number"
          error={!!errors.totalFloors?.message}
        />
        <FormField
          control={control}
          name="yearBuilt"
          label="Ano de construção"
          type="number"
          error={!!errors.yearBuilt?.message}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        <CheckboxCustom
          control={control}
          name="furnished"
          label="Mobiliado"
          helperText={errors.furnished?.message}
        />
        <CheckboxCustom
          control={control}
          name="petFriendly"
          label="Aceita animais"
          helperText={errors.petFriendly?.message}
        />
        <CheckboxCustom
          control={control}
          name="acceptsExchange"
          label="Aceita troca"
          helperText={errors.acceptsExchange?.message}
        />
        <CheckboxCustom
          control={control}
          name="acceptsFinancing"
          label="Aceita financiamento"
          helperText={errors.acceptsFinancing?.message}
        />
        <CheckboxCustom
          control={control}
          name="acceptsCarTrade"
          label="Aceita veículo na troca"
          helperText={errors.acceptsCarTrade?.message}
        />
        <CheckboxCustom
          control={control}
          name="isLaunch"
          label="Lançamento"
          helperText={errors.isLaunch?.message}
        />
        <CheckboxCustom
          control={control}
          name="isReadyToMove"
          label="Pronto para morar"
          helperText={errors.isReadyToMove?.message}
        />
      </div>
    </div>
  );
};
