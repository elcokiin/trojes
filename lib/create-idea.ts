import { mutate } from "swr";
import type { Idea } from "@/types/idea";

export async function insertIdea(content: string): Promise<Idea | null> {
  const trimmed = content.trim();
  if (!trimmed) return null;

  try {
    const res = await fetch("/api/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: trimmed }),
    });

    if (!res.ok) return null;

    const { idea } = await res.json();
    return {
      ...idea,
      pinned: Boolean(idea.pinned),
    };
  } catch (error) {
    console.error("Failed to create idea:", error);
    return null;
  }
}

export async function createIdea(
  content: string,
): Promise<{ ok: boolean; idea?: Idea }> {
  const idea = await insertIdea(content);
  if (!idea) return { ok: false };
  return { ok: true, idea };
}

function buildOptimisticIdea(content: string): Idea {
  const now = new Date().toISOString();
  return {
    id: `optimistic-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    content,
    source: "web",
    status: "inbox",
    tags: null,
    pinned: false,
    background_color: null,
    created_at: now,
    updated_at: now,
    deleted_at: null,
  };
}

export async function optimisticCreateIdea(
  content: string,
): Promise<{ ok: boolean; idea?: Idea }> {
  const trimmed = content.trim();
  if (!trimmed) return { ok: false };

  const optimistic = buildOptimisticIdea(trimmed);

  await mutate(
    (key) =>
      typeof key === "string" &&
      key.startsWith("/api/ideas?") &&
      key.includes("status=inbox"),
    (current: { ideas: Idea[] } | undefined) => {
      if (!current) return current;
      return { ...current, ideas: [optimistic, ...current.ideas] };
    },
    { revalidate: false },
  );

  try {
    const res = await fetch("/api/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: trimmed }),
    });

    if (!res.ok) {
      await mutate(
        (key) =>
          typeof key === "string" &&
          key.startsWith("/api/ideas?") &&
          key.includes("status=inbox"),
        (current: { ideas: Idea[] } | undefined) => {
          if (!current) return current;
          return {
            ...current,
            ideas: current.ideas.filter((i) => i.id !== optimistic.id),
          };
        },
        { revalidate: false },
      );
      return { ok: false };
    }

    const { idea: serverIdea } = await res.json();
    const real: Idea = {
      ...serverIdea,
      pinned: Boolean(serverIdea.pinned),
    };

    const keyFilter = (key: unknown) =>
      typeof key === "string" &&
      key.startsWith("/api/ideas?") &&
      key.includes("status=inbox");

    await mutate(
      keyFilter,
      (current: { ideas: Idea[] } | undefined) => {
        if (!current) return current;
        return {
          ...current,
          ideas: current.ideas.map((i) =>
            i.id === optimistic.id
              ? { ...real, id: optimistic.id, _serverId: real.id }
              : i,
          ),
        };
      },
      { revalidate: false },
    );

    return { ok: true, idea: real };
  } catch (error) {
    console.error("Failed to create idea:", error);
    await mutate(
      (key) =>
        typeof key === "string" &&
        key.startsWith("/api/ideas?") &&
        key.includes("status=inbox"),
      (current: { ideas: Idea[] } | undefined) => {
        if (!current) return current;
        return {
          ...current,
          ideas: current.ideas.filter((i) => i.id !== optimistic.id),
        };
      },
      { revalidate: false },
    );
    return { ok: false };
  }
}
