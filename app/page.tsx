"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useIsMobile } from "@/hooks/use-mobile"
import { Dashboard } from "@/components/app/dashboard"

export default function Home() {
  const { data: session, status } = useSession()
  const isMobile = useIsMobile()

  if (status === "loading") return null

  if (!session?.user) {
    redirect("/login")
  }

  if (isMobile) {
    redirect("/mobile")
  }

  return <Dashboard user={session.user} />
}
