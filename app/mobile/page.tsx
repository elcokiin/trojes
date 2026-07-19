import { Suspense } from "react"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { MobileCaptureEntry } from "@/components/app/mobile-entry"

export default async function MobileEntryPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <Suspense>
      <MobileCaptureEntry />
    </Suspense>
  )
}
