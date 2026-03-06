"use client";

import { HouseHeart } from "lucide-react";

import { ChartLastDays } from "@/features/dashboard/components/chart-last-days";
import { useMyListingsCount } from "@/features/dashboard/hooks/use-my-listings-count";

const PanelPage = () => {
  const { count, isLoading } = useMyListingsCount();

  return (
    <div className="px-2 space-y-12">
      <div className="grid md:grid-cols-4 gap-6">
        <div className="flex flex-col p-6 rounded-lg bg-primary/5">
          <div className="flex items-center justify-between gap-2">
            <span className="bg-primary/10 p-1 rounded">
              <HouseHeart className="text-primary" />
            </span>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold">
              {isLoading ? (
                <span className="inline-block w-8 h-7 bg-primary/10 rounded animate-pulse" />
              ) : (
                count
              )}
            </p>
            <p className="text-sm text-muted-foreground">Imóveis cadastrados</p>
          </div>
        </div>
      </div>

      <ChartLastDays />
    </div>
  );
};

export default PanelPage;
