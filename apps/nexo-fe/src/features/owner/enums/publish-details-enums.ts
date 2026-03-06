export enum Purpose {
  SALE = "SALE",
  RENT = "RENT",
}

export enum Listing {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SOLD = "SOLD",
  RENTED = "RENTED",
}

export enum PropertyType {
  APARTMENT = "APARTMENT",
  HOUSE = "HOUSE",
  CONDO_HOUSE = "CONDO_HOUSE",
  STUDIO = "STUDIO",
  LAND = "LAND",
  COMMERCIAL = "COMMERCIAL",
  FARM = "FARM",
  OTHER = "OTHER",
}

export const PurposeLabel: Record<Purpose, string> = {
  [Purpose.SALE]: "Venda",
  [Purpose.RENT]: "Aluguel",
};

export const PropertyTypeLabel: Record<PropertyType, string> = {
  [PropertyType.APARTMENT]: "Apartamento",
  [PropertyType.HOUSE]: "Casa",
  [PropertyType.CONDO_HOUSE]: "Condomínio",
  [PropertyType.STUDIO]: "Kitnet/Studio",
  [PropertyType.LAND]: "Terreno",
  [PropertyType.COMMERCIAL]: "Comercial",
  [PropertyType.FARM]: "Sítio/Fazenda",
  [PropertyType.OTHER]: "Outro",
};

export const StatusLabel: Record<Listing, string> = {
  [Listing.DRAFT]: "Rascunho",
  [Listing.ACTIVE]: "Ativo",
  [Listing.INACTIVE]: "Inativo",
  [Listing.SOLD]: "Vendido",
  [Listing.RENTED]: "Alugado",
};
