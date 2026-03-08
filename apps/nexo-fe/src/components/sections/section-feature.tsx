import React from "react";

type SectionFeatureProps = {
  children: React.ReactNode;
};

export const SectionFeature = ({ children }: SectionFeatureProps) => {
  return (
    <div className="w-full bg-primary/5">
      <div className="flex flex-col space-y-6 max-w-7xl mx-auto px-6 py-2">
        {children}
      </div>
    </div>
  );
};
