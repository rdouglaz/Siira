"use client";

import { useEffect } from "react";

export function SWRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("[SW] Registered:", registration.scope);
          
          // Check for updates periodically
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  // New version available
                  console.log("[SW] New version available");
                  // Could show a toast here to prompt refresh
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error("[SW] Registration failed:", error);
        });
    }
  }, []);

  return null;
}