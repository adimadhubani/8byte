import axios from "axios";
import { PortfolioResponse } from "../types";

// vite dev me proxy use ho raha hai, prod me env var
const API_URL = import.meta.env.VITE_API_URL || "/api";

export const client = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json"
  }
});

export async function pullPortfolio(signal?: AbortSignal): Promise<PortfolioResponse> {
  const { data } = await client.get<PortfolioResponse>("/portfolio", { signal });
  return data;
}

export const getPortfolio = pullPortfolio;
