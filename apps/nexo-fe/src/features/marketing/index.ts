export { useMarketing, MARKETING_KEY } from "./hooks/use-marketing.hook";
export { getMarketing, getMarketingBySlug } from "./services/marketing.service";
export { MarketingCard } from "./components/marketing-card.component";
export { MarketingSearchForm } from "./components/marketing-search-form.component";
export { SingleProperty } from "./components/single-property.component";
export { ListingPlan } from "./types/marketing.type";
export type {
  MarketingResponse,
  MarketingQueryParams,
  PaginatedMarketingResponse,
  ListingStatus,
  MediaItem,
} from "./types/marketing.type";
