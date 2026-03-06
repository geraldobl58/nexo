import dynamic from "next/dynamic";

// Leaflet não funciona com SSR
export const LeafletMap = dynamic(
  () =>
    import("@/components/ui/leaflet-map/leaflet-map").then((m) => m.LeafletMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] bg-gray-100 rounded-lg animate-pulse" />
    ),
  },
);
