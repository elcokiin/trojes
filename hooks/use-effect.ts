"use client"

import { useEffect } from "react"
import { Effect } from "effect"
import { AppLayer } from "@/lib/effect-runtime"

function runEffectWithLayer<A, E>(
  effect: Effect.Effect<A, E, any>,
): Promise<A> {
  return Effect.runPromise(Effect.provide(effect, AppLayer) as Effect.Effect<A, E, never>)
}

export function useEffectRunEffect(
  makeEffect: () => Effect.Effect<void, never, never>,
  deps: unknown[] = [],
): void {
  useEffect(() => {
    runEffectWithLayer(makeEffect()).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

export function useEffectRunEffectUnchecked(
  makeEffect: () => Effect.Effect<void, any, any>,
  deps: unknown[] = [],
): void {
  useEffect(() => {
    runEffectWithLayer(makeEffect()).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
