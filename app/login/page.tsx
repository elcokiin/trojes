import type { Metadata } from "next"
import { cookies, headers } from "next/headers"
import { LoginExperience } from "@/components/login/login-experience"
import { resolveSiteLocale, SITE_LOCALE_COOKIE } from "@/lib/site-locale"

async function getRequestLocale() {
  const [cookieStore, requestHeaders] = await Promise.all([cookies(), headers()])
  return resolveSiteLocale(
    cookieStore.get(SITE_LOCALE_COOKIE)?.value,
    requestHeaders.get("accept-language"),
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  return locale === "es"
    ? { title: "Iniciar sesión — Trojes" }
    : { title: "Sign in — Trojes" }
}

export default async function LoginPage() {
  return <LoginExperience locale={await getRequestLocale()} />
}
