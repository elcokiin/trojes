export type SiteLocale = "en" | "es"

export const SITE_LOCALE_COOKIE = "trojes-locale"

export function resolveSiteLocale(
  savedLocale?: string | null,
  acceptLanguage?: string | null,
): SiteLocale {
  if (savedLocale === "en" || savedLocale === "es") return savedLocale

  const browserLocale = acceptLanguage
    ?.split(",")
    .map((language) => language.split(";")[0]?.trim().toLowerCase())
    .find((language) => language?.startsWith("en") || language?.startsWith("es"))

  return browserLocale?.startsWith("en") ? "en" : "es"
}

export function saveSiteLocale(locale: SiteLocale) {
  document.cookie = `${SITE_LOCALE_COOKIE}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`
}
