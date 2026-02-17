import keycloak from "@/lib/keycloak";
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use(async (config) => {
  if (keycloak.authenticated) {
    await keycloak.updateToken(30);

    config.headers.Authorization = `Bearer ${keycloak.token}`;
  }

  return config;
});
