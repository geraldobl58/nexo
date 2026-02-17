import { api } from "@/config/api";
import { User } from "../types";

export async function syncMe(): Promise<User> {
  const res = await api.get("/auth/me");
  return res.data;
}
