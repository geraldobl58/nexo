import { Purpose, PropertyType } from "../enums/publish-details-enums";

export type CreatePublishDetailsData = {
  purpose: Purpose;
  type: PropertyType;
  title: string;
  description: string;
  price: number;
  condominiumFee?: number;
  iptuYearly?: number;
};
