"use client";

import Image from "next/image";
import { useThemeToggle } from "@/hooks/use-theme-toggle";
import { LoginClouds } from "@/components/login/login-clouds";
import type { MousePosition } from "@/hooks/use-mouse-parallax";
import sunImg from "@/public/assets/backgrounds/sun.webp";
import moonImg from "@/public/assets/backgrounds/moon.webp";

const STAR_PARALLAX_INTENSITY = 6;

const stars = [
  // [sizePx, opacity, leftPercent, topPercent]
  [1, 0.8, 5, 4],
  [1.5, 0.9, 10, 8],
  [2, 0.7, 15, 3],
  [1, 0.6, 8, 15],
  [1.5, 0.8, 20, 6],
  [1, 0.9, 25, 12],
  [2, 0.5, 12, 20],
  [1, 0.7, 30, 5],
  [1.5, 0.6, 35, 10],
  [1, 0.8, 18, 25],
  [2, 0.9, 40, 8],
  [1, 0.5, 22, 18],
  [1.5, 0.7, 28, 3],
  [1, 0.8, 32, 15],
  [2, 0.6, 38, 20],
  [1, 0.9, 14, 10],
  [1.5, 0.5, 42, 5],
  [1, 0.7, 6, 28],
  [2, 0.8, 48, 12],
  [1, 0.6, 16, 30],
  [1.5, 0.9, 34, 22],
  [1, 0.5, 45, 18],
  [2, 0.7, 50, 25],
  [1, 0.8, 3, 22],
  [1.5, 0.6, 24, 32],
  [1, 0.9, 55, 4],
  [2, 0.5, 36, 28],
  [1, 0.7, 40, 35],
  [1.5, 0.8, 52, 15],
  [1, 0.6, 58, 8],
  [2, 0.9, 60, 20],
  [1, 0.5, 44, 30],
  [1.5, 0.7, 65, 5],
  [1, 0.8, 70, 12],
  [2, 0.6, 75, 8],
  [1, 0.9, 80, 4],
  [1.5, 0.5, 85, 15],
  [1, 0.7, 90, 6],
  [2, 0.8, 95, 10],
  [1, 0.6, 5, 50],
  [1.5, 0.9, 15, 45],
  [1, 0.5, 25, 55],
  [2, 0.7, 35, 48],
  [1, 0.8, 45, 60],
  [1.5, 0.6, 55, 52],
  [1, 0.9, 65, 65],
  [2, 0.5, 75, 58],
  [1, 0.7, 85, 70],
  [1.5, 0.8, 20, 70],
  [1, 0.6, 40, 78],
  [2, 0.9, 60, 72],
  [1, 0.5, 80, 80],
  [1.5, 0.7, 10, 85],
  [1, 0.8, 30, 88],
  [2, 0.6, 50, 82],
  [1, 0.9, 70, 85],
  [1.5, 0.5, 90, 40],
  [1, 0.7, 8, 65],
  [2, 0.8, 38, 40],
  [1, 0.6, 68, 50],
  [1.5, 0.9, 82, 35],
  [1, 0.5, 95, 55],
  [2, 0.7, 18, 60],
  [1, 0.8, 72, 42],
  [1.5, 0.6, 48, 7],
  [1, 0.9, 3, 35],
  [2, 0.5, 56, 42],
  [1, 0.7, 42, 38],
  [1.5, 0.8, 78, 45],
  [1, 0.6, 62, 28],
  [2, 0.9, 88, 22],
  [1, 0.5, 25, 40],
];

export function LoginBackground({
  mouseCoordinates,
}: {
  mouseCoordinates: MousePosition;
}) {
  const { toggleTheme } = useThemeToggle();

  const starGradients = stars
    .map(
      ([sizePx, opacity, leftPercent, topPercent]) =>
        `radial-gradient(${sizePx}px ${sizePx}px at ${leftPercent}% ${topPercent}%, rgba(255,255,255,${opacity}), transparent)`,
    )
    .join(",");

  return (
    <>
      <div className="absolute inset-0 z-0 bg-linear-to-b from-[#4fc3f7] to-white dark:from-[#0f0c29] dark:to-[#302b63]">
        <div
          className="absolute -inset-4 opacity-0 dark:opacity-100 transition-[opacity,transform] duration-200 ease-out will-change-transform"
          style={{
            backgroundImage: starGradients,
            transform: `translate3d(${-mouseCoordinates.x * STAR_PARALLAX_INTENSITY}px, ${-mouseCoordinates.y * STAR_PARALLAX_INTENSITY}px, 0)`,
          }}
        />
      </div>
      <LoginClouds mouseCoordinates={mouseCoordinates} />
      <div className="absolute top-4 right-24 size-56 rounded-full blur-[80px] pointer-events-none select-none z-20 bg-[rgba(255,160,0,0.6)] dark:bg-[rgba(255,255,255,0.5)] max-[1200px]:hidden" />
      <button
        type="button"
        onClick={(e) => toggleTheme({ x: e.clientX, y: e.clientY })}
        className="absolute top-12 right-32 size-32 cursor-pointer z-30 max-[1200px]:hidden"
        aria-label="Toggle theme"
      >
        <Image
          src={sunImg}
          alt="Sun"
          className="size-full pointer-events-none select-none dark:hidden"
          priority
        />
        <Image
          src={moonImg}
          alt="Moon"
          className="size-full pointer-events-none select-none hidden dark:block"
          priority
        />
      </button>
    </>
  );
}
