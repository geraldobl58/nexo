"use client";

import { Card } from "@/components/ui/card/card";

import { useMarketing } from "../hooks/use-marketing.hook";

import { formatCurrency } from "@/lib/formatted-money";

import { ListingPlan, MarketingResponse } from "../types/marketing.type";
import { SectionFeature } from "@/components/sections/section-feature";
import { Heading } from "@/components/ui/heading/heading";
import { Carousel } from "@/components/ui/carousel/carousel";

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

const CAROUSEL_PROPS = {
  dots: true,
  arrows: true,
  infinite: false,
  slidesToShow: 3,
  slidesToScroll: 2,
} as const;

const PLAN_SECTIONS: {
  plan: ListingPlan;
  title: string;
  description: string;
  badge: string;
}[] = [
  {
    plan: "SUPER",
    title: "Super Destaques",
    description:
      "Os imóveis com maior visibilidade da plataforma. Exclusivos, selecionados e prontos para você.",
    badge: "SUPER",
  },
  {
    plan: "PREMIUM",
    title: "Imóveis Premium",
    description:
      "Imóveis premium com tour virtual e fotos profissionais. Qualidade e sofisticação em cada detalhe.",
    badge: "PREMIUM",
  },
  {
    plan: "FEATURED",
    title: "Imóveis em Destaque",
    description:
      "Imóveis selecionados com os melhores preços do mercado. Encontre a casa dos seus sonhos hoje mesmo!",
    badge: "DESTAQUE",
  },
];

export const MarketingCard = () => {
  const { listings } = useMarketing({ status: "ACTIVE", page: 1, limit: 50 });

  const byPlan = (plan: ListingPlan) =>
    toCarouselItems(listings.filter((l) => l.listingPlan === plan));

  const regularItems = toCarouselItems(
    listings.filter(
      (l) => l.listingPlan === "FREE" || l.listingPlan === "STANDARD",
    ),
  );

  return (
    <div>
      {PLAN_SECTIONS.map(({ plan, title, description, badge }) => {
        const items = byPlan(plan);
        if (items.length === 0) return null;
        return (
          <SectionFeature key={plan}>
            <>
              <Heading title={title} description={description} badge={badge} />
              <Carousel items={items} {...CAROUSEL_PROPS} />
            </>
          </SectionFeature>
        );
      })}

      {regularItems.length > 0 && (
        <SectionFeature>
          <>
            <Heading
              title="Mais imóveis para você"
              description="Imóveis com ótimos preços, selecionados para você. Encontre a casa dos seus sonhos hoje mesmo!"
            />
            <Carousel items={regularItems} {...CAROUSEL_PROPS} />
          </>
        </SectionFeature>
      )}
    </div>
  );
};
