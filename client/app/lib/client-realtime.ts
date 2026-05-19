"use client";

import { io } from "socket.io-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

function resolveSocketBaseUrl(apiBaseUrl: string) {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_SOCKET_BASE_URL;

  if (configuredBaseUrl) {
    return configuredBaseUrl;
  }

  if (/^https?:\/\//i.test(apiBaseUrl)) {
    return apiBaseUrl.replace(/\/api\/?$/, "");
  }

  if (typeof window === "undefined") {
    return "http://localhost:8000";
  }

  return `${window.location.protocol}//${window.location.hostname}:8000`;
}

export function createClientRealtimeSocket(accessToken: string) {
  return io(resolveSocketBaseUrl(API_BASE_URL), {
    path: "/ws/socket.io",
    transports: ["websocket"],
    auth: {
      token: accessToken,
    },
  });
}
