import { MAX_IMAGES_FREE } from "@/lib/media-upload";

export const BREADCRUMB_MAP: Record<string, string> = {
  "/panel": "Dashboard",
  "/panel/imoveis": "Imóveis",
  "/panel/agendamentos": "Agendamentos",
  "/panel/clientes": "Clientes",
  "/panel/mensagens": "Mensagens",
  "/panel/ajustes": "Ajustes",
  "/panel/faturamento": "Faturamento",
};

// MOCK: enquanto o pagamento não estiver implementado os imóveis são criados
// com plano FREE (limite de 5 fotos). Quando os planos pagos forem ativados,
// esse valor virá do contexto/estado do usuário.
export const CURRENT_PLAN_MAX_IMAGES = MAX_IMAGES_FREE;
