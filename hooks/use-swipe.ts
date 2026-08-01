"use client";

import { useCallback, useRef, useState } from "react";

const SWIPE_THRESHOLD = 50;

type SwipeDirection = "left" | "right";

interface TouchPoint {
  x: number;
  y: number;
}

function getTouchPoint(e: React.TouchEvent): TouchPoint {
  return { x: e.touches[0].clientX, y: e.touches[0].clientY };
}

function useTouchStart(onStart?: () => void) {
  const touchStart = useRef<TouchPoint | null>(null);

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      touchStart.current = getTouchPoint(e);
      onStart?.();
    },
    [onStart],
  );

  return { touchStart, onTouchStart };
}

export function useSwipe(onSwipe: (direction: SwipeDirection) => void) {
  const { touchStart, onTouchStart } = useTouchStart();

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
    [onSwipe, touchStart],
  );

  return { onTouchStart, onTouchEnd };
}

interface UseSwipeUpOptions {
  onSwipeUp: () => void;
  onTouchStart?: () => void;
}

export function useSwipeUp({ onSwipeUp, onTouchStart: onStart }: UseSwipeUpOptions) {
  const [isSwipingUp, setIsSwipingUp] = useState(false);

  const { touchStart, onTouchStart } = useTouchStart(() => {
    setIsSwipingUp(false);
    onStart?.();
  });

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart.current) return;
      const deltaY = e.touches[0].clientY - touchStart.current.y;
      setIsSwipingUp(deltaY < -15);
    },
    [touchStart],
  );

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      setIsSwipingUp(false);
      if (!touchStart.current) return;
      const deltaY = e.changedTouches[0].clientY - touchStart.current.y;
      touchStart.current = null;
      if (deltaY < -SWIPE_THRESHOLD) {
        onSwipeUp();
      }
    },
    [onSwipeUp, touchStart],
  );

  return { isSwipingUp, onTouchStart, onTouchMove, onTouchEnd };
}