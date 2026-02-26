export enum Purpose {
  SALE = "SALE",
  RENT = "RENT",
}

export const PurposeLabel: Record<Purpose, string> = {
  [Purpose.SALE]: "Venda",
  [Purpose.RENT]: "Aluguel",
};

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
