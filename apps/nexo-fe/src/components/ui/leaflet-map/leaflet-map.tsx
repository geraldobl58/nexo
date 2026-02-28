"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMap } from "react-leaflet";
import type { Map as LeafletMapType } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Ícone customizado centralizado — anchor no centro do ícone para alinhar
// perfeitamente com o círculo de aproximação
const centeredIcon = L.divIcon({
  className: "",
  html: `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="7" fill="#7c3aed" stroke="white" stroke-width="2.5"/>
      <circle cx="16" cy="16" r="3" fill="white"/>
    </svg>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16], // centro do ícone — alinha exatamente com o círculo
  popupAnchor: [0, -18],
});

// ---------------------------------------------------------------------------
// Move o mapa suavemente quando as coordenadas mudam
// ---------------------------------------------------------------------------

function MapFlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    // Desloca o centro 0.0015° para sul para que o marcador apareça
    // mais acima no viewport (visualmente "mais para cima")
    map.flyTo([lat - 0.0015, lng], 16, { animate: true, duration: 1.2 });
  }, [lat, lng, map]);
  return null;
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export interface LeafletMapProps {
  lat: number;
  lng: number;
  height?: string;
  /** Raio do círculo de aproximação em metros (padrão: 200m) */
  circleRadius?: number;
}

export function LeafletMap({
  lat,
  lng,
  height = "400px",
  circleRadius = 200,
}: LeafletMapProps) {
  /**
   * React 18 StrictMode double-mounts components: mount → cleanup → remount.
   * O problema com useState(false) + setMounted(true) é que o React PRESERVA
   * o estado (mounted=true) no remount, fazendo o MapContainer tentar
   * re-inicializar o mesmo div antes que map.remove() consiga agir.
   *
   * Solução: setTimeout(0) garante que o timer do primeiro mount (StrictMode)
   * é sempre cancelado no cleanup antes de disparar. Só o mount estável
   * (segundo mount) chega a disparar o timer → renderiza MapContainer com
   * um div limpo.
   */
  const [ready, setReady] = useState(false);
  const mapRef = useRef<LeafletMapType | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 0);
    return () => {
      clearTimeout(timer);
      setReady(false);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  if (!ready) {
    return (
      <div
        style={{ height, width: "100%", borderRadius: "0.5rem" }}
        className="bg-gray-100 animate-pulse"
      />
    );
  }

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={16}
      style={{ height, width: "100%", borderRadius: "0.5rem" }}
      scrollWheelZoom={false}
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Circle
        center={[lat, lng]}
        radius={circleRadius}
        pathOptions={{
          color: "#7c3aed",
          fillColor: "#7c3aed",
          fillOpacity: 0.1,
          weight: 4,
          opacity: 0.5,
        }}
      />
      <Marker position={[lat, lng]} icon={centeredIcon} />
      <MapFlyTo lat={lat} lng={lng} />
    </MapContainer>
  );
}
