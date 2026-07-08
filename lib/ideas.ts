export interface ColorOption {
  id: string | null;
  name: string;
}

export const CARD_COLORS: ColorOption[] = [
  { id: null, name: "Default" },
  { id: "red", name: "Red" },
  { id: "green", name: "Green" },
  { id: "blue", name: "Blue" },
  { id: "orange", name: "Orange" },
  { id: "amber", name: "Amber" },
  { id: "olive", name: "Olive" },
  { id: "teal", name: "Teal" },
  { id: "indigo", name: "Indigo" },
  { id: "purple", name: "Purple" },
  { id: "coral", name: "Coral" },
  { id: "terracotta", name: "Terracotta" },
];

export function formatTimeInTrash(deletedAt: string | null): string | null {
  if (!deletedAt) return null;

  const deleted = new Date(deletedAt);
  const now = new Date();
  const diffMs = now.getTime() - deleted.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "Just deleted";
  if (diffMinutes < 60) return `In trash for ${diffMinutes}m`;
  if (diffHours < 24) return `In trash for ${diffHours}h`;
  if (diffDays === 1) return "In trash for 1 day";
  return `In trash for ${diffDays} days`;
}

export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
