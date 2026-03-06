"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { FormField } from "@/components/ui/form-field/form-field";
import { usePublish } from "../context/publish-context";
import {
  createPushlishContactSchema,
  PublishContactData,
} from "../schemas/publish-contact";

export const StepContact = () => {
  const { formData, setContactData, setContactValid } = usePublish();

  const {
    control,
    formState: { errors, isValid },
  } = useForm<PublishContactData>({
    resolver: zodResolver(createPushlishContactSchema),
    mode: "onChange",
    // Restaura os dados salvos no context ao voltar para este step
    defaultValues: {
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      contactWhatsApp: "",
      ...formData.contact,
    },
  });

  // Sincroniza validade com o context
  useEffect(() => {
    setContactValid(isValid);
  }, [isValid, setContactValid]);

  // Persiste alterações dos campos no context
  const allValues = useWatch({ control });
  useEffect(() => {
    setContactData(allValues as Partial<PublishContactData>);
  }, [allValues, setContactData]);

  return (
    <div className="flex flex-col w-full px-4 py-4 rounded-lg space-y-8 mt-10 shadow-md bg-white">
      <h3 className="text-2xl font-bold">Dados de contato</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <FormField
          control={control}
          name="contactName"
          label="Nome de contato"
          type="text"
          required
          error={!!errors.contactName?.message}
        />
        <FormField
          control={control}
          name="contactEmail"
          label="Email de contato"
          type="email"
          required
          error={!!errors.contactEmail?.message}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <FormField
          control={control}
          name="contactPhone"
          label="Telefone de contato"
          type="text"
          required
          error={!!errors.contactPhone?.message}
        />
        <FormField
          control={control}
          name="contactWhatsApp"
          label="WhatsApp de contato"
          type="text"
          required
          error={!!errors.contactWhatsApp?.message}
        />
      </div>
    </div>
  );
};
