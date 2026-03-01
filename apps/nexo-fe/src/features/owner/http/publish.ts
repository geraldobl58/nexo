/**
 * Publish HTTP Module
 * Funções de comunicação com a API de publicações
 */

import { api } from "@/config/api";
import {
  CreatePublishResponse,
  CreatePublishInput,
} from "../types/publish-types";

/**
 * Cria uma nova publicação.
 * Endpoint: POST /marketing
 *
 * @param data - Dados da publicação a ser criada
 * @returns Publicação criada
 */
export async function createPublish(
  data: CreatePublishInput,
): Promise<CreatePublishResponse> {
  const response = await api.post<CreatePublishResponse>("/marketing", data);
  return response.data;
}
