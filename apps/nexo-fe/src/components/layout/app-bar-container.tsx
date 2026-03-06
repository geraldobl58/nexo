"use client";

import { usePathname } from "next/navigation";
import { Search, Bell, ChevronRight } from "lucide-react";

import { BREADCRUMB_MAP } from "@/constants";

export const PanelAppBar = () => {
  const pathname = usePathname();
  const currentPage = BREADCRUMB_MAP[pathname] ?? "";
  const isRoot = pathname === "/panel";

  return (
    <header className="fixed top-0 right-0 left-60 h-16 bg-white border-b border-gray-100 z-30 flex items-center gap-4 px-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span
          className={
            isRoot
              ? "text-sm font-semibold text-gray-900"
              : "text-sm text-gray-400"
          }
        >
          Painel
        </span>
        {!isRoot && (
          <>
            <ChevronRight size={14} className="text-gray-400" />
            <span className="text-sm font-semibold text-gray-900">
              {currentPage}
            </span>
          </>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Buscar imóveis..."
          className="w-60 pl-9 pr-3 py-1.5 text-sm bg-gray-50 border border-gray-100 rounded-lg outline-none hover:border-gray-300 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-colors"
        />
      </div>

      {/* Notifications */}
      <button className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-100 text-gray-500 hover:bg-gray-50 transition-colors">
        <Bell size={18} />
      </button>
    </header>
  );
};
