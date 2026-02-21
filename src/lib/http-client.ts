import axios from "axios";

const configuredBaseUrl = (
  process.env.NEXT_PUBLIC_API_URL ??
  ""
).trim().replace(/\/+$/, "");

export const http = axios.create({
  baseURL: configuredBaseUrl || undefined,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});
