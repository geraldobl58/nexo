import { SectionFeature } from "@/components/sections/section-feature";
import { SectionHero } from "@/components/sections/section-hero";
import { SectionInformation } from "@/components/sections/section-information";
import { SectionSystem } from "@/components/sections/section-system";

const MarketingPage = () => {
  return (
    <div className="w-full">
      <SectionHero />
      <SectionInformation />
      <SectionFeature />
      <SectionSystem />
    </div>
  );
};

export default MarketingPage;
