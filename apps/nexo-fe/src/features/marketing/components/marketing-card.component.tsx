"use client";

import { Card } from "@/components/ui/card/card";

import { useMarketing } from "../hooks/use-marketing.hook";

import { formatCurrency } from "@/lib/formatted-money";

import { MarketingResponse } from "../types/marketing.type";
import { SectionFeature } from "@/components/sections/section-feature";
import { Heading } from "@/components/ui/heading/heading";
import { Carousel } from "@/components/ui/carousel/carousel";
import { SETTINGS_CAROUSEL } from "@/lib/settings-carousel";

function toCarouselItems(marketing: MarketingResponse[]) {
  return marketing.map((marketing) => (
    <Card
      key={marketing.id}
      propertyName={marketing.title}
      price={formatCurrency(marketing.price)}
      condoFee={
        marketing.condominiumFee
          ? formatCurrency(marketing.condominiumFee)
          : undefined
      }
      address={`${marketing.district}, ${marketing.city} - ${marketing.state}`}
      bedrooms={marketing.bedrooms ?? 0}
      bathrooms={marketing.bathrooms ?? 0}
      garages={marketing.garageSpots ?? 0}
      area={marketing.areaM2 ?? 0}
      imageUrl={marketing.media?.[0]?.url ?? "/images/placeholder.jpg"}
      imageAlt={marketing.title}
      badge={marketing.isFeatured}
      badgeText="Destaque"
    />
  ));
}

export const MarketingCard = () => {
  const { listings } = useMarketing({ status: "ACTIVE", page: 1, limit: 50 });

  const featuredItems = toCarouselItems(listings.filter((l) => l.isFeatured));

  const regularItems = toCarouselItems(listings.filter((l) => !l.isFeatured));

  return (
    <div>
      {featuredItems.length > 0 && (
        <SectionFeature>
          <>
            <Heading
              title="Imóveis em Destaque"
              description="Imóveis selecionados com os melhores preços do mercado. Encontre a casa dos seus sonhos hoje mesmo!"
              badge="DESTAQUE"
            />
            <Carousel items={featuredItems} {...SETTINGS_CAROUSEL} />
          </>
        </SectionFeature>
      )}

      {regularItems.length > 0 && (
        <SectionFeature>
          <>
            <Heading
              title="Mais imóveis para você"
              description="Imóveis com ótimos preços, selecionados para você. Encontre a casa dos seus sonhos hoje mesmo!"
            />
            <Carousel items={regularItems} {...SETTINGS_CAROUSEL} />
          </>
        </SectionFeature>
      )}
    </div>
  );
};
