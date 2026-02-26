/**
 * Publish HTTP Module
 * Funções de comunicação com a API de publicações
 */

import { api } from "@/config/api";
import {
  CreatePublishResponse,
  CreatePusblishInput,
} from "../types/publish-types";

/**
 * Cria uma nova publicação.
 * Endpoint: POST /listings
 *
 * @param data - Dados da publicação a ser criada
 * @returns Publicação criada
 */
export async function createPublish(
  data: CreatePusblishInput,
): Promise<CreatePublishResponse> {
  const response = await api.post<CreatePublishResponse>("/listings", data);
  return response.data;
}
