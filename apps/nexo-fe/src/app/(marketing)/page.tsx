import { SectionHero } from "@/app/(marketing)/components/SectionHero";
import { SectionInformation } from "@/app/(marketing)/components/SectionInformation";
import { SectionFeature } from "@/app/(marketing)/components/SectionFeature";
import { SectionSystem } from "./components/SectionSystem";

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
