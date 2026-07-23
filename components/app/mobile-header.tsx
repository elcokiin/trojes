"use client";

import Link from "next/link";
import Image from "next/image";

export function MobileHeader() {
  return (
    <header className="px-4 h-14 border-b bg-background flex items-center justify-center">
      <div className="flex-1 border-t border-foreground/10" />
      <Link href="/dashboard" className="flex items-center gap-1.5 px-3">
        <Image src="/icon.svg" alt="Trojes" width={28} height={28} className="size-7" />
        <span className="text-2xl font-bold">Trojes</span>
      </Link>
      <div className="flex-1 border-t border-foreground/10" />
    </header>
  );
}
