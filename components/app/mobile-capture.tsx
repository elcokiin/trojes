"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MobileEditor } from "@/components/editor/mobile-editor";
import { useIdeas } from "@/hooks/use-ideas";

const CREATED_TOAST_MS = 900;

export function MobileCapturePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const [showCreatedToast, setShowCreatedToast] = useState(false);
  const saveFailedRef = useRef(false);
  const unmountedRef = useRef(false);
  const { create } = useIdeas({ status: "inbox" });

  useEffect(() => {
    return () => {
      unmountedRef.current = true;
    };
  }, []);

  const handleLeave = useCallback(() => {
    if (unmountedRef.current) return;
    if (from) {
      router.back();
    } else {
      router.push("/dashboard");
    }
  }, [from, router]);

  const handleClose = useCallback(() => {
    if (saveFailedRef.current) {
      saveFailedRef.current = false;
      return;
    }
    handleLeave();
  }, [handleLeave]);

  const handleCapture = useCallback(
    async (content: string) => {
      const { ok } = await create(content);
      if (!ok) {
        saveFailedRef.current = true;
        return;
      }
      setShowCreatedToast(true);
      await new Promise((resolve) => setTimeout(resolve, CREATED_TOAST_MS));
    },
    [create],
  );

  return (
    <div className="flex flex-col h-dvh bg-background">
      <MobileEditor
        onCapture={handleCapture}
        onClose={handleClose}
        overlay={false}
      />

      {showCreatedToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-foreground text-background text-sm font-medium shadow-lg transition-opacity duration-200">
          Idea created
        </div>
      )}
    </div>
  );
}
