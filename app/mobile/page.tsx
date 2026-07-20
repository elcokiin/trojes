import { Suspense } from "react"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { Skeleton } from "@/components/ui/skeleton"
import { MobileCaptureEntry } from "@/components/app/mobile-entry"

function MobileEntrySkeleton() {
  return (
    <div className="flex flex-col h-dvh bg-background">
      <header className="px-4 h-14 border-b bg-background flex items-center justify-center">
        <div className="flex-1 border-t border-foreground/10" />
        <div className="flex items-center gap-1.5 px-3">
          <Skeleton className="size-7 rounded-full" />
          <Skeleton className="h-7 w-20" />
        </div>
        <div className="flex-1 border-t border-foreground/10" />
      </header>
      <div className="flex-1" />
      <div className="grid grid-cols-2">
        <div className="aspect-square m-1 rounded-xl bg-accent animate-pulse" />
        <div className="aspect-square m-1 rounded-xl bg-accent animate-pulse" />
      </div>
      <div className="flex items-center justify-center pb-3 pt-2 gap-2">
        <Skeleton className="size-3.5 rounded-full" />
        <Skeleton className="h-3 w-32" />
        <Skeleton className="size-3.5 rounded-full" />
      </div>
    </div>
  )
}

export default async function MobileEntryPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <Suspense fallback={<MobileEntrySkeleton />}>
      <MobileCaptureEntry />
    </Suspense>
  )
}
