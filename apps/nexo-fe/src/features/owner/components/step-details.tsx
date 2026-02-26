"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createPushlishDetailsSchema } from "../schemas/publish-details";
import { CreatePublishDetailsData } from "../types/publish-details-types";
import { Purpose, PropertyType } from "../enums/publish-details-enums";
import { SelectControl } from "@/components/ui/SelectControl/SelectControl";
import { FormField } from "@/components/ui/FormField/FormField";
import { CurrencyField } from "@/components/ui/CurrencyField/CurrencyField";
import { usePublish } from "../context/publish-context";

export const StepDetails = () => {
  const { formData, setDetailsData, setDetailsValid } = usePublish();

  const {
    control,
    formState: { errors, isValid },
  } = useForm<CreatePublishDetailsData>({
    resolver: zodResolver(createPushlishDetailsSchema),
    mode: "onChange",
    // Restaura os dados salvos no context ao voltar para este step
    defaultValues: {
      purpose: "" as Purpose,
      type: "" as PropertyType,
      title: "",
      description: "",
      price: undefined,
      condominiumFee: undefined,
      iptuYearly: undefined,
      ...formData.details,
    },
  });

  // Sincroniza validade com o context
  useEffect(() => {
    setDetailsValid(isValid);
  }, [isValid, setDetailsValid]);

  // Persiste qualquer mudança dos campos no context
  const allValues = useWatch({ control });
  useEffect(() => {
    setDetailsData(allValues as Partial<CreatePublishDetailsData>);
  }, [allValues, setDetailsData]);

  return (
    <div className="flex flex-col w-full px-4 py-4 rounded-lg space-y-8 mt-10 shadow-md bg-white">
      <h3 className="text-2xl font-bold">Detalhes do imóvel</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <SelectControl
          control={control}
          name="purpose"
          label="Finalidade"
          options={[
            { value: Purpose.SALE, label: "Venda" },
            { value: Purpose.RENT, label: "Aluguel" },
          ]}
          error={!!errors.purpose?.message}
        />

        <SelectControl
          control={control}
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
          error={!!errors.type?.message}
        />
      </div>

      <div className="w-full">
        <FormField
          control={control}
          name="title"
          label="Título do anúncio"
          type="text"
          error={!!errors.title?.message}
        />
      </div>

      <div className="w-full">
        <FormField
          control={control}
          name="description"
          label="Descrição do anúncio"
          type="text"
          rows={10}
          multiline
          error={!!errors.description?.message}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        <CurrencyField
          control={control}
          name="price"
          label="Preço"
          error={!!errors.price?.message}
        />
        <CurrencyField
          control={control}
          name="condominiumFee"
          label="Condomínio (opcional)"
          error={!!errors.condominiumFee?.message}
        />
        <CurrencyField
          control={control}
          name="iptuYearly"
          label="IPTU (anual, opcional)"
          error={!!errors.iptuYearly?.message}
        />
      </div>
    </div>
  );
};
