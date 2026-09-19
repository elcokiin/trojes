import { normalizeIdea } from "@/lib/ideas";
import { useIdeasStore } from "@/stores/ideas-store";
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
    const normalized = normalizeIdea(idea);
    useIdeasStore.getState().upsertIdea(normalized);
    return normalized;
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

export async function optimisticCreateIdea(
  content: string,
): Promise<{ ok: boolean; idea?: Idea }> {
  return createIdea(content);
}