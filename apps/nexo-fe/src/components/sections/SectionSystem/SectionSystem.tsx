import Image from "next/image";
import { BadgeCheck } from "lucide-react";

import { Heading } from "@/components/ui/Heading/Heading";
import Button from "@mui/material/Button";

export const SectionSystem = () => {
  return (
    <div className="w-full border-b">
      <div className="grid md:grid-cols-2 gap-8 space-y-6 max-w-7xl mx-auto px-6 py-12 md:py-24">
        <div className="space-y-8">
          <Heading
            title="Gerencie seus imóveis com simplicidade"
            description="Um painel completo e intuitivo para você acompanhar o desempenho dos seus anúncios, gerenciar leads e fechar negócios mais rápido."
          />
          <ul className="flex flex-col gap-4 mt-6 text-gray-700">
            <li className="flex items-center gap-2">
              <BadgeCheck className="size-4 text-green-400" />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Dashboard com métricas em tempo real
              </span>
            </li>
            <li className="flex items-center gap-2">
              <BadgeCheck className="size-4 text-green-400" />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Integração com WhatsApp para comunicação direta com leads
              </span>
            </li>
            <li className="flex items-center gap-2">
              <BadgeCheck className="size-4 text-green-400" />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Integração com CRM e ferramentas de marketing
              </span>
            </li>
            <li className="flex items-center gap-2">
              <BadgeCheck className="size-4 text-green-400" />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Suporte dedicado e treinamento personalizado
              </span>
            </li>
            <li className="flex items-center gap-2">
              <BadgeCheck className="size-4 text-green-400" />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Relatórios detalhados e exportação de dados
              </span>
            </li>
            <li className="flex items-center gap-2">
              <BadgeCheck className="size-4 text-green-400" />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Notificações em tempo real
              </span>
            </li>
            <li className="flex items-center gap-2">
              <BadgeCheck className="size-4 text-green-400" />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Integração com CRM e ferramentas de marketing
              </span>
            </li>
            <li className="flex items-center gap-2">
              <BadgeCheck className="size-4 text-green-400" />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Cadstro e gerenciamento de imóveis simplificado
              </span>
            </li>
          </ul>
          <Button variant="contained">Começar agora</Button>
        </div>
        <div>
          <Image
            src="/images/section-system.png"
            alt="Imagem ilustrativa do painel de controle do sistema"
            width={546}
            height={428}
          />
        </div>
      </div>
    </div>
  );
};
