import { z } from "zod";
import { Purpose, PropertyType } from "../enums/listing.enum";

export const createPublishDetailsSchema = z.object({
  purpose: z.nativeEnum(Purpose),
  type: z.nativeEnum(PropertyType),
  title: z.string().min(5, "O campo é obrigatório"),
  description: z
    .string()
    .min(10, "A descrição deve conter pelo menos 10 caracteres"),
  price: z.number().positive("O preço deve ser um número positivo"),
  condominiumFee: z
    .number()
    .positive("A taxa de condomínio deve ser um número positivo")
    .optional(),
  iptuYearly: z
    .number()
    .positive("O IPTU deve ser um número positivo")
    .optional(),
});

export type PublishDetailsData = z.infer<typeof createPublishDetailsSchema>;
