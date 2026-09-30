import { Suspense } from "react"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { Skeleton } from "@/components/ui/skeleton"
import { MobileCapturePage } from "@/components/app/mobile-capture"

function MobileCaptureSkeleton() {
  return (
    <div className="flex flex-col h-dvh bg-background">
      <div className="flex-1 flex flex-col min-h-0 gap-3 p-4">
        <Skeleton className="h-7 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div className="grid grid-cols-2 border-t border-border shrink-0">
        <div className="h-12 bg-muted animate-pulse" />
        <div className="h-12 bg-muted animate-pulse" />
      </div>
    </div>
  )
}

export default async function MobileCaptureRoute() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <Suspense fallback={<MobileCaptureSkeleton />}>
      <MobileCapturePage />
    </Suspense>
  )
}
