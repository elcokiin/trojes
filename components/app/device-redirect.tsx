"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useIsMobile } from "@/hooks/use-mobile"

interface DeviceRedirectProps {
  mobileHref: string
}

export function DeviceRedirect({ mobileHref }: DeviceRedirectProps) {
  const router = useRouter()
  const isMobile = useIsMobile()

  useEffect(() => {
    if (isMobile) {
      router.replace(mobileHref)
    }
  }, [isMobile, mobileHref, router])

  return null
}
