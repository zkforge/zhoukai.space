const BASE_URL = import.meta.env.BASE_URL.replace(/\/+$/, "");

export function withBase(path = "/") {
  return `${BASE_URL}/${path.replace(/^\/+/, "")}`;
}

export function withoutBase(pathname: string) {
  if (!BASE_URL) return pathname;
  if (pathname === BASE_URL) return "/";
  return pathname.startsWith(`${BASE_URL}/`)
    ? pathname.slice(BASE_URL.length)
    : pathname;
}
