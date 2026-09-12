"use client"

import { useEffect, useRef, useState } from "react"
import { Effect } from "effect"
import { AppLayer } from "@/lib/effect-runtime"

interface EffectResult<A, E> {
  data: A | null
  error: E | null
  isLoading: boolean
}

function runEffectWithLayer<A, E>(
  effect: Effect.Effect<A, E, any>,
): Promise<A> {
  return Effect.runPromise(Effect.provide(effect, AppLayer) as Effect.Effect<A, E, never>)
}

export function useEffectRun<A, E>(
  makeEffect: () => Effect.Effect<A, E, never>,
  deps: unknown[] = [],
): EffectResult<A, E> {
  const [state, setState] = useState<EffectResult<A, E>>({
    data: null,
    error: null,
    isLoading: true,
  })
  const cancelledRef = useRef(false)

  useEffect(() => {
    cancelledRef.current = false
    setState({ data: null, error: null, isLoading: true })

    const program = makeEffect().pipe(Effect.catch(() => Effect.succeed(null as A)))

    runEffectWithLayer(program).then(
      (data) => {
        if (!cancelledRef.current) {
          setState({ data, error: null, isLoading: false })
        }
      },
      (error) => {
        if (!cancelledRef.current) {
          setState({ data: null, error: error as E, isLoading: false })
        }
      },
    )

    return () => {
      cancelledRef.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}

export function useEffectResult<A, E>(
  makeEffect: () => Effect.Effect<A, E, never>,
  deps: unknown[] = [],
): EffectResult<A, E> {
  const [state, setState] = useState<EffectResult<A, E>>({
    data: null,
    error: null,
    isLoading: true,
  })
  const cancelledRef = useRef(false)

  useEffect(() => {
    cancelledRef.current = false
    setState({ data: null, error: null, isLoading: true })

    const program = makeEffect().pipe(Effect.catch(() => Effect.succeed(null as A)))

    runEffectWithLayer(program).then(
      (data) => {
        if (!cancelledRef.current) {
          setState({ data, error: null, isLoading: false })
        }
      },
      (error) => {
        if (!cancelledRef.current) {
          setState({ data: null, error: error as E, isLoading: false })
        }
      },
    )

    return () => {
      cancelledRef.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
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
