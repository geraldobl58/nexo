import { Purpose, PropertyType } from "../enums/listing.enum";

export type CreatePublishDetailsData = {
  purpose: Purpose;
  type: PropertyType;
  title: string;
  description: string;
  price: number;
  condominiumFee?: number;
  iptuYearly?: number;
};
