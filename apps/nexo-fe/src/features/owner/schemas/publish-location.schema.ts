import { z } from "zod";

/**
 * Schema de localização do imóvel.
 * Campos obrigatórios para habilitar o botão "Continuar":
 *   zipcode, street, streetNumber, district, city, state
 * Opcional: complement, latitude, longitude (preenchido automaticamente)
 */
export const createPublishLocationSchema = z.object({
  zipcode: z.string().min(8, "CEP inválido").max(9, "CEP inválido"),
  street: z.string().optional(),
  streetNumber: z.string().optional(),
  district: z.string().optional(),
  complement: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export type PublishLocationData = z.infer<typeof createPublishLocationSchema>;
