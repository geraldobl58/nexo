import { SectionFeature } from "@/components/sections/SectionFeature/SectionFeature";
import { SectionHero } from "@/components/sections/SectionHero/SectionHero";
import { SectionInformation } from "@/components/sections/SectionInformation/SectionInformation";
import { SectionSystem } from "@/components/sections/SectionSystem/SectionSystem";

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
