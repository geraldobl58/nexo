import { CardInformation } from "@/components/ui/card-information/card-information";
import { ShieldUser } from "lucide-react";

export const SectionInformation = () => {
  return (
    <div className="grid md:grid-cols-4 gap-6 px-4 py-12 max-w-7xl mx-auto">
      {Array.from({ length: 4 }).map((_, index) => (
        <CardInformation
          key={index}
          icon={<ShieldUser className="size-6 text-primary" />}
          title="Segurança e Confiabilidade"
          description="Garantimos a segurança e confiabilidade em todas as transações, proporcionando tranquilidade aos nossos clientes."
        />
      ))}
    </div>
  );
};
