"use server";

import { getListingById } from "@/features/owner/services/listing.service";
import { getMarketing } from "../services/marketing.service";
import { MarketingQueryParams } from "../types/marketing.type";

export async function getMarketingAction(params: MarketingQueryParams) {
  return getMarketing(params);
}

export async function getMarketingBySlugAction(slug: string) {
  const getMarketing = await getListingById(slug);

  return getMarketing;
}
