import { useAuth } from "@clerk/expo";
import { setAuthTokenGetter, setBaseUrl } from "@workspace/api-client-react";
import React, { useEffect } from "react";

const domain = process.env.EXPO_PUBLIC_DOMAIN;
if (domain) {
  const baseUrl = domain.startsWith("http") ? domain : `https://${domain}`;
  setBaseUrl(baseUrl);
}

/**
 * Mounts the Clerk session token getter so generated API hooks attach
 * `Authorization: Bearer <token>` automatically. Render once near the root,
 * inside <ClerkProvider>.
 */
export function ApiAuthBridge() {
  const { getToken } = useAuth();
  useEffect(() => {
    setAuthTokenGetter(async () => {
      try {
        return await getToken();
      } catch {
        return null;
      }
    });
    return () => setAuthTokenGetter(null);
  }, [getToken]);
  return null;
}
