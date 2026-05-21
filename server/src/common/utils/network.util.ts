const LOCALHOST_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

function isPrivateNetworkHost(hostname: string) {
  return (
    /^10\./.test(hostname) ||
    /^192\.168\./.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
  );
}

function parseExtraAllowedOrigins() {
  return (process.env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getListenHost() {
  return process.env.HOST?.trim() || '0.0.0.0';
}

export function isAllowedOrigin(origin?: string | null) {
  if (!origin) {
    return true;
  }

  const extraAllowedOrigins = parseExtraAllowedOrigins();

  if (extraAllowedOrigins.includes(origin)) {
    return true;
  }

  try {
    const url = new URL(origin);
    return (
      (url.protocol === 'http:' || url.protocol === 'https:') &&
      (LOCALHOST_HOSTS.has(url.hostname) || isPrivateNetworkHost(url.hostname))
    );
  } catch {
    return false;
  }
}

export function createCorsOriginDelegate() {
  return (
    origin: string | undefined,
    callback: (error: Error | null, allow?: boolean) => void,
  ) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin ${origin ?? 'unknown'} is not allowed by CORS`));
  };
}
