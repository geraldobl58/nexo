import { SectionHero } from "@/components/sections/section-hero";
import { SectionInformation } from "@/components/sections/section-information";
import { SectionSystem } from "@/components/sections/section-system";

import { MarketingCard } from "@/features/marketing/components/marketing-card.component";

const MarketingPage = () => {
  return (
    <div className="w-full">
      <SectionHero />
      <SectionInformation />
      <SectionSystem />
      <MarketingCard />
    </div>
  );
};

export default MarketingPage;
