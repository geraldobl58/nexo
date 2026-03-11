import { z } from "zod";

export const createPublishComoditiesSchema = z.object({
  areaM2: z
    .number({ error: "Área é obrigatória" })
    .positive("Deve ser maior que zero"),
  builtArea: z.number().positive("Deve ser maior que zero").optional(),
  bedrooms: z
    .number({ error: "Quartos é obrigatório" })
    .min(0, "Não pode ser negativo"),
  suites: z.number().min(0, "Não pode ser negativo").optional(),
  bathrooms: z
    .number({ error: "Banheiros é obrigatório" })
    .min(0, "Não pode ser negativo"),
  garageSpots: z.number().min(0, "Não pode ser negativo").optional(),
  floor: z.number().min(0, "Não pode ser negativo").optional(),
  totalFloors: z.number().min(0, "Não pode ser negativo").optional(),
  furnished: z.boolean().optional(),
  petFriendly: z.boolean().optional(),
  yearBuilt: z
    .number()
    .min(1800, "Ano inválido")
    .max(new Date().getFullYear(), "Ano não pode ser futuro")
    .optional(),
  acceptsExchange: z.boolean().optional(),
  acceptsFinancing: z.boolean().optional(),
  acceptsCarTrade: z.boolean().optional(),
  isLaunch: z.boolean().optional(),
  isReadyToMove: z.boolean().optional(),
});

export type PublishComoditiesData = z.infer<
  typeof createPublishComoditiesSchema
>;
