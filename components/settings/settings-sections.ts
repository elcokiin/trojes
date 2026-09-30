export const SECTIONS = [
  "appearance",
  "keyboard",
  "api",
  "install",
  "account",
] as const;

export type SettingsSection = (typeof SECTIONS)[number];
