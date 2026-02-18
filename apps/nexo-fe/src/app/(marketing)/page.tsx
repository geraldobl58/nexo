import { SectionHero } from "@/app/(marketing)/components/section-hero";
import { SectionForm } from "./components/search-form";

const MarketingPage = () => {
  return (
    <div className="w-full">
      <div className="flex flex-col items-center justify-center space-y-8 mx-auto py-24 bg-primary/5">
        <SectionHero />
        <SectionForm />
      </div>
    </div>
  );
};

export default MarketingPage;
