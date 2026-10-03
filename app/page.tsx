import type { Metadata } from "next"
import { cookies, headers } from "next/headers"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { LandingPage } from "@/components/landing/landing-page"
import { authOptions } from "@/lib/auth"
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
    ? {
        title: "Trojes — De ideas sueltas a claridad",
        description:
          "Captura tus ideas al instante, vuelve a ellas cuando quieras y descubre cuáles merecen crecer.",
      }
    : {
        title: "Trojes — From fleeting ideas to clarity",
        description:
          "Capture ideas in a moment, come back to them anytime, and discover which ones deserve to grow.",
      }
}

export default async function Home() {
  const session = await getServerSession(authOptions)
  if (session?.user) redirect("/dashboard")

  return <LandingPage initialLocale={await getRequestLocale()} />
}
