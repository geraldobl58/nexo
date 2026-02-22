import { SectionHero } from "@/app/(marketing)/components/SectionHero";
import { SectionInformation } from "@/app/(marketing)/components/SectionInformation";
import { SectionFeature } from "@/app/(marketing)/components/SectionFeature";

const MarketingPage = () => {
  return (
    <div className="w-full">
      <SectionHero />
      <SectionInformation />
      <SectionFeature />
    </div>
  );
};

export default MarketingPage;
