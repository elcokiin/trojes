"use client";

import { signIn } from "next-auth/react";
import { GoogleSignInButton } from "@/components/login/google-sign-in-button";
import { LoginBackground } from "@/components/login/login-background";
import { LoginSceneBackground } from "@/components/login/login-scene-background";

export default function LoginPage() {
  return (
    <div className="relative h-dvh overflow-hidden">
      <LoginBackground />
      <LoginSceneBackground />
      <div className="absolute inset-0 z-20 grid place-items-center p-4 -mt-5">
        <GoogleSignInButton
          onClick={() => signIn("google", { callbackUrl: "/" })}
        />
      </div>
    </div>
  );
}
