"use client"

import { signIn } from "next-auth/react"
import { GoogleSignInButton } from "@/components/login/google-sign-in-button"

export default function LoginPage() {
  return (
    <div className="h-dvh flex items-center justify-center p-4 bg-cover bg-center bg-[url(/assets/backgrounds/login-day.webp)] dark:bg-[url(/assets/backgrounds/login-night.webp)] overflow-hidden">
      <div className="-mt-5">
        <GoogleSignInButton onClick={() => signIn("google", { callbackUrl: "/" })} />
      </div>
    </div>
  )
}
