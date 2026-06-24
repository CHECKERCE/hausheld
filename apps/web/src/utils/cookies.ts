export function getCookie(name: string): string | null {
  const encodedName = encodeURIComponent(name);
  const entry = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${encodedName}=`));

  if (!entry) {
    return null;
  }

  return decodeURIComponent(entry.slice(encodedName.length + 1));
}

export function setCookie(name: string, value: string, days = 365): void {
  const maxAge = days * 24 * 60 * 60;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";

  document.cookie =
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}` +
    `; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

export function deleteCookie(name: string): void {
  document.cookie =
    `${encodeURIComponent(name)}=; Path=/; Max-Age=0; SameSite=Lax`;
}