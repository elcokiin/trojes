export const Z = {
  SKY: "z-0",
  CLOUDS: "z-1",
  SCENE: "z-10",
  GLOW: "z-20",
  CONTENT: "z-20",
  TOGGLE: "z-30",
} as const

export type ZIndex = (typeof Z)[keyof typeof Z]
