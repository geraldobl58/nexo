import { SectionHero } from "@/components/sections/section-hero";
import { SectionInformation } from "@/components/sections/section-information";
import { SectionSystem } from "@/components/sections/section-system";

import { MarketingCard } from "@/features/marketing/components/marketing-card.component";
import { getMarketingAction } from "@/features/marketing/actions/marketing.action";

const MarketingPage = async () => {
  const { items: listings } = await getMarketingAction({
    status: "ACTIVE",
    page: 1,
    limit: 50,
  });

  return (
    <div className="w-full">
      <SectionHero />
      <SectionInformation />
      <SectionSystem />
      <MarketingCard listings={listings} />
    </div>
  );
};

export default MarketingPage;
