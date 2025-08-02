type CookieOptions = {
  expires?: Date;
  maxAge?: number;
  domain?: string;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
};

const DEFAULT_OPTIONS: CookieOptions = {
  path: "/",
  secure: true,
  sameSite: "Strict",
};

function optionsToString(options: CookieOptions = {}): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const chunks: string[] = [];

  if (opts.expires) {
    chunks.push(`expires=${opts.expires.toUTCString()}`);
  }

  if (opts.maxAge !== undefined) {
    chunks.push(`max-age=${opts.maxAge}`);
  }

  if (opts.domain) {
    chunks.push(`domain=${opts.domain}`);
  }

  if (opts.path) {
    chunks.push(`path=${opts.path}`);
  }

  if (opts.secure) {
    chunks.push("secure");
  }

  if (opts.httpOnly) {
    chunks.push("httponly");
  }

  if (opts.sameSite) {
    chunks.push(`samesite=${opts.sameSite.toLowerCase()}`);
  }

  return chunks.join("; ");
}

export function setCookie(
  name: string,
  value: string,
  options?: CookieOptions,
) {
  document.cookie = `${name}=${encodeURIComponent(value)}; ${optionsToString(options)}`;
}

export function getCookie(name: string): string | null {
  const cookies = document.cookie.split(";");
  const cookie = cookies.find((c) => c.trim().startsWith(`${name}=`));

  if (!cookie) return null;

  const [, value] = cookie.split("=");
  return decodeURIComponent(value.trim());
}
