import { Suspense } from "react"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { SettingsPage } from "@/components/settings/settings-page"

export default async function SettingsRoutePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <Suspense>
      <SettingsPage user={session.user} />
    </Suspense>
  )
}
