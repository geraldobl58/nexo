"use client";

import { SectionFeature } from "@/components/sections/section-feature";
import { SectionHero } from "@/components/sections/section-hero";
import { SectionInformation } from "@/components/sections/section-information";
import { SectionSystem } from "@/components/sections/section-system";
import { Card } from "@/components/ui/card/card";
import { Carousel } from "@/components/ui/carousel/carousel";
import { Heading } from "@/components/ui/heading/heading";
import { useMyListings } from "@/features/owner/hooks/use-my-listings";
import { CreatePublishResponse, ListingPlan } from "@/features/owner/types/publish-types";
import { formatCurrency } from "@/lib/formatted-money";

function toCarouselItems(listings: CreatePublishResponse[]) {
  return listings.map((listing) => (
    <Card
      key={listing.id}
      propertyName={listing.title}
      price={formatCurrency(listing.price)}
      condoFee={
        listing.condominiumFee
          ? formatCurrency(listing.condominiumFee)
          : undefined
      }
      address={`${listing.district}, ${listing.city} - ${listing.state}`}
      bedrooms={listing.bedrooms ?? 0}
      bathrooms={listing.bathrooms ?? 0}
      garages={listing.garageSpots ?? 0}
      area={listing.areaM2 ?? 0}
      imageUrl={listing.media?.[0]?.url ?? "/images/placeholder.jpg"}
      imageAlt={listing.title}
      badge={listing.isFeatured}
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
    description: "Os imóveis com maior visibilidade da plataforma. Exclusivos, selecionados e prontos para você.",
    badge: "SUPER",
  },
  {
    plan: "PREMIUM",
    title: "Imóveis Premium",
    description: "Imóveis premium com tour virtual e fotos profissionais. Qualidade e sofisticação em cada detalhe.",
    badge: "PREMIUM",
  },
  {
    plan: "FEATURED",
    title: "Imóveis em Destaque",
    description: "Imóveis selecionados com os melhores preços do mercado. Encontre a casa dos seus sonhos hoje mesmo!",
    badge: "DESTAQUE",
  },
];

const MarketingPage = () => {
  const { listings } = useMyListings({ status: "ACTIVE", page: 1, limit: 50 });

  const byPlan = (plan: ListingPlan) =>
    toCarouselItems(listings.filter((l) => l.listingPlan === plan));

  const regularItems = toCarouselItems(
    listings.filter((l) => l.listingPlan === "FREE" || l.listingPlan === "STANDARD"),
  );

  return (
    <div className="w-full">
      <SectionHero />
      <SectionInformation />

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

      <SectionSystem />

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

export default MarketingPage;
