import Link from "next/link";
import { Building, ShoppingBag, User2 } from "lucide-react";

import { CardInformation } from "@/components/ui/CardInformation/CardInformation";
import { Heading } from "@/components/ui/Heading/Heading";
import Image from "next/image";
import Button from "@mui/material/Button";

const PagePublish = () => {
  return (
    <div>
      <div className="flex items-center justify-center mt-10 mb-10">
        <Heading
          align="center"
          title="Com qual perfil você se identifica?"
          description="Escolha a opção que melhor representa você para começar a anunciar seu imóvel na Nexo"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-8 mt-12 px-4 py-12 max-w-7xl mx-auto">
        <Link
          href="/publish/owner"
          className="hover:scale-[1.02] transition-transform"
        >
          <CardInformation
            align="center"
            icon={<User2 className="size-6 text-primary" />}
            title="Sou proprietário"
            description="Quero anunciar meu imóvel para alugar ou vender"
          />
        </Link>
        <Link
          href="/publish/agent"
          className="hover:scale-[1.02] transition-transform"
        >
          <CardInformation
            align="center"
            icon={<ShoppingBag className="size-6 text-primary" />}
            title="Imobiliária / Corretor"
            description="Gerencie múltiplos anúncios e clientes de forma profissional"
          />
        </Link>
        <Link
          href="/publish/builder"
          className="hover:scale-[1.02] transition-transform"
        >
          <CardInformation
            align="center"
            icon={<Building className="size-6 text-primary" />}
            title="Incorporadora / Construtora"
            description="Divulgue lançamentos e empreendimentos em grande escala"
          />
        </Link>
      </div>

      <div className="mt-12 h-[600px] bg-primary">
        <div className="grid md:grid-cols-2 gap-8 px-4 py-12 max-w-7xl mx-auto">
          <div className="flex flex-col justify-center items-center text-white">
            <Heading
              title="Anuncie seu imóvel gratuitamente"
              description="Alcance milhares de compradores e locatários qualificados. Processo simples, rápido e sem custos iniciais."
              content={
                <>
                  <Button
                    color="secondary"
                    variant="contained"
                    LinkComponent={Link}
                    href="/publish"
                  >
                    Começar agora
                  </Button>
                </>
              }
            />
          </div>
          <div className="flex items-center justify-center">
            <Image
              src="/images/placeholder-house.png"
              alt="Placeholder house"
              width={500}
              height={300}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PagePublish;
