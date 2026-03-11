import { z } from "zod";

export const createPublishContactSchema = z.object({
  contactName: z.string().min(3, "O nome de contato é obrigatório"),
  contactEmail: z.string().email("Email inválido"),
  contactPhone: z.string().min(10, "Telefone inválido"),
  contactWhatsApp: z.string().min(10, "WhatsApp inválido"),
});

export type PublishContactData = z.infer<typeof createPublishContactSchema>;
