import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import {
  Bath,
  BedDouble,
  Heart,
  LocateFixed,
  Scan,
  Warehouse,
  Zap,
} from "lucide-react";
import Image from "next/image";

export type CardProps = {
  badge?: boolean;
  badgeText?: string;
  favorite?: boolean;
  price?: string;
  condoFee?: string;
  propertyName?: string;
  address?: string;
  bedrooms?: number;
  bathrooms?: number;
  garages?: number;
  area?: number;
  imageUrl?: string;
  imageAlt?: string;
  onFavoriteClick?: () => void;
  onContactClick?: () => void;
};

export const Card = ({
  badge = true,
  badgeText = "Destaque",
  favorite = true,
  price = "R$1.500.000",
  condoFee = "R$ 850",
  propertyName = "Casa Contemporânea no Jardins",
  address = "Jardins, São Paulo - SP",
  bedrooms = 4,
  bathrooms = 4,
  garages = 4,
  area = 4,
  imageUrl = "/images/placeholder.jpg",
  imageAlt = "Imagem do imóvel",
  onFavoriteClick,
  onContactClick,
}: CardProps) => {
  return (
    <div className="border min-h-[520px] rounded-lg bg-white shadow-sm">
      <div className="relative">
        <div className="absolute flex items-center justify-between w-full p-4">
          {badge && (
            <h2 className="text-xs font-bold text-primary bg-white rounded-full px-3 py-1">
              {badgeText}
            </h2>
          )}
          {favorite && (
            <span
              role="button"
              aria-label="Adicionar aos favoritos"
              onClick={onFavoriteClick}
              className="flex items-center justify-center gap-1 text-sm text-muted-foreground bg-white rounded-full size-10 cursor-pointer"
            >
              <Heart />
            </span>
          )}
        </div>
        <Image
          src={imageUrl}
          alt={imageAlt}
          width={400}
          height={300}
          className="rounded-lg object-cover w-full h-48 md:h-64"
        />
      </div>
      <div className="p-4 space-y-6">
        <div className="flex items-center justify-between gap-2 mt-4">
          <p className="text-2xl font-bold">{price}</p>
          {condoFee && (
            <p className="text-sm text-muted-foreground">Cond. {condoFee}</p>
          )}
        </div>
        <div>
          <p className="text-base font-medium">{propertyName}</p>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>
              <LocateFixed className="size-4" />
            </span>
            <span>{address}</span>
          </p>
        </div>
        <div className="mb-2 mt-2">
          <Divider />
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground font-bold">
          <span aria-label="Quartos">
            <BedDouble className="size-5" />
          </span>
          <span>{bedrooms}</span>
          <span aria-label="Banheiros">
            <Bath className="size-5" />
          </span>
          <span>{bathrooms}</span>
          <span aria-label="Garagens">
            <Warehouse className="size-5" />
          </span>
          <span>{garages}</span>
          <span aria-label="Área">
            <Scan className="size-5" />
          </span>
          <span>{area}m²</span>
        </div>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Zap className="size-5" />}
          color="primary"
          onClick={onContactClick}
        >
          Contatar anunciante
        </Button>
      </div>
    </div>
  );
};
