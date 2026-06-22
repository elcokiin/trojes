"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Download, CheckCircle2, Share2, PlusSquare } from "lucide-react"

function isStandaloneMode() {
  if (typeof window === "undefined") return false
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    navigator.standalone === true
  )
}

function isBeforeInstallPromptEvent(e: Event): e is BeforeInstallPromptEvent {
  return "prompt" in e
}

export function PwaInstallManager() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window === "undefined") return false
    return isStandaloneMode()
  })
  const [isIos, setIsIos] = useState(() => {
    if (typeof window === "undefined") return false
    return /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase())
  })

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      if (isBeforeInstallPromptEvent(event)) {
        setDeferredPrompt(event)
      }
    }

    const onAppInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt)
    window.addEventListener("appinstalled", onAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt)
      window.removeEventListener("appinstalled", onAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    if (choice.outcome === "accepted") {
      setDeferredPrompt(null)
      setIsInstalled(true)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">Install Troje</Label>
        <p className="mt-1 text-xs text-muted-foreground">
          Add Troje to your home screen for a native app-like experience.
        </p>
      </div>

      {isInstalled ? (
        <div className="rounded-lg border bg-muted/30 p-3 text-sm flex items-center gap-2">
          <CheckCircle2 className="size-4 text-green-500" />
          App is already installed on this device.
        </div>
      ) : deferredPrompt ? (
        <Button className="w-full" onClick={handleInstall}>
          <Download className="size-4 mr-2" />
          Install App
        </Button>
      ) : isIos ? (
        <div className="rounded-lg border bg-muted/30 p-3 space-y-2 text-sm">
          <p className="font-medium">Install on iPhone/iPad</p>
          <p className="text-muted-foreground text-xs flex items-center gap-2">
            <Share2 className="size-4" />
            Tap Share in Safari.
          </p>
          <p className="text-muted-foreground text-xs flex items-center gap-2">
            <PlusSquare className="size-4" />
            Choose Add to Home Screen.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
          Install prompt is not available yet. Open this site in Chrome/Edge and use browser install option.
        </div>
      )}
    </div>
  )
}
