/**
 * Resposta completa da API de publicações, incluindo detalhes do imóvel, localização e comodidades.
 * Endpoint: POST /listings
 */

import { PropertyType, Purpose } from "../enums/publish-details-enums";

/**
 * Resposta de sucesso da API de publicações, contendo os dados completos do imóvel criado.
 * Endpoint: POST /listings
 */
export interface CreatePublishResponse {
  advertiserId: string;
  purpose: Purpose;
  type: PropertyType;
  title: string;
  description: string;
  price: number;
  condominiumFee: number;
  iptuYearly: number;
  city: string;
  state: string;
  district: string;
  street: string;
  streetNumber: string;
  complement: string;
  zipcode: string;
  latitude: number;
  longitude: number;
  areaM2: number;
  builtArea: number;
  bedrooms: number;
  suites: number;
  bathrooms: number;
  garageSpots: number;
  floor: number;
  totalFloors: number;
  furnished: boolean;
  petFriendly: boolean;
  yearBuilt: number;
  acceptsExchange: boolean;
  acceptsFinancing: boolean;
  acceptsCarTrade: boolean;
  isLaunch: boolean;
  isReadyToMove: boolean;
  metaTitle: string;
  metaDescription: string;
}

export interface CreatePusblishInput {
  advertiserId: string;
  purpose: Purpose;
  type: PropertyType;
  title: string;
  description: string;
  price: number;
  condominiumFee?: number;
  iptuYearly?: number;
  city: string;
  state: string;
  district: string;
  street: string;
  streetNumber: string;
  complement: string;
  zipcode: string;
  latitude: number;
  longitude: number;
  areaM2: number;
  builtArea?: number;
  bedrooms: number;
  suites?: number;
  bathrooms: number;
  garageSpots?: number;
  floor?: number;
  totalFloors?: number;
  furnished?: boolean;
  petFriendly?: boolean;
  yearBuilt?: number;
  acceptsExchange?: boolean;
  acceptsFinancing?: boolean;
  acceptsCarTrade?: boolean;
  isLaunch?: boolean;
  isReadyToMove?: boolean;
}

/**
 * State genérico para API responses
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

// =============================================
// ACTION STATES
// =============================================

/**
 * State para publicação de imóvel, contendo os dados do imóvel criado.
 * Endpoint: POST /listings
 */
export interface CreatePublishActionState {
  success: boolean;
  message?: string;
  data?: CreatePublishResponse;
}
