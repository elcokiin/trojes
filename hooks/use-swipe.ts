"use client";

import { useCallback, useRef } from "react";

const SWIPE_THRESHOLD = 50;

type SwipeDirection = "left" | "right";

export function useSwipe(onSwipe: (direction: SwipeDirection) => void) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart.current) return;

      const deltaX = e.changedTouches[0].clientX - touchStart.current.x;
      const deltaY = e.changedTouches[0].clientY - touchStart.current.y;

      touchStart.current = null;

      if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;
      if (Math.abs(deltaY) > Math.abs(deltaX) * 0.5) return;

      onSwipe(deltaX > 0 ? "right" : "left");
    },
    [onSwipe],
  );

  return { onTouchStart, onTouchEnd };
}
