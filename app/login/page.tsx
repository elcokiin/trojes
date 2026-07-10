"use client";

import { signIn } from "next-auth/react";
import { useMouseParallax } from "@/hooks/use-mouse-parallax";
import { GoogleSignInButton, GOOGLE_BTN_SELECTOR } from "@/components/login/google-sign-in-button";
import { LoginBackground } from "@/components/login/login-background";
import { LoginSceneBackground } from "@/components/login/login-scene-background";

export default function LoginPage() {
  const mouseCoordinates = useMouseParallax({ ignoreSelector: GOOGLE_BTN_SELECTOR });

  return (
    <div className="relative h-dvh overflow-hidden">
      <LoginBackground mouseCoordinates={mouseCoordinates} />
      <LoginSceneBackground mouseCoordinates={mouseCoordinates} />
      <div className="absolute inset-0 z-20 grid place-items-center p-4 -mt-5">
        <GoogleSignInButton
          onClick={() => signIn("google", { callbackUrl: "/" })}
        />
      </div>
    </div>
  );
}
