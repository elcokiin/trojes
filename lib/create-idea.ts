import { mutate } from "swr";
import type { Idea } from "@/types/idea";

const INBOX_RE = /^\/api\/ideas\?.*status=inbox/;

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

export async function optimisticCreateIdea(
  content: string,
): Promise<{ ok: boolean; idea?: Idea }> {
  const idea = await insertIdea(content);
  if (!idea) return { ok: false };

  // Revalidate inbox lists so the new idea appears
  mutate((key) => typeof key === "string" && INBOX_RE.test(key));

  return { ok: true, idea };
}
