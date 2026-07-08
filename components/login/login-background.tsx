"use client"

const stars = [
  [1, 0.8, 10, 15], [1.5, 0.6, 25, 8], [1, 0.9, 40, 22], [2, 0.5, 55, 5],
  [1, 0.7, 70, 18], [1.5, 0.8, 85, 10], [1, 0.6, 95, 25], [1, 0.5, 5, 55],
  [1.5, 0.7, 35, 65], [1, 0.9, 50, 58], [2, 0.4, 65, 72], [1, 0.8, 80, 48],
  [1.5, 0.6, 20, 82], [1, 0.7, 45, 88], [1, 0.5, 60, 35], [2, 0.9, 8, 72],
  [1, 0.6, 75, 30], [1.5, 0.8, 90, 62], [1, 0.7, 5, 40], [1, 0.5, 48, 42],
  [1.5, 0.9, 72, 55], [1, 0.6, 88, 35], [2, 0.5, 15, 68], [1, 0.8, 30, 50],
  [1.5, 0.7, 95, 75], [1, 0.9, 55, 78], [1, 0.6, 38, 12], [2, 0.7, 68, 45],
  [1, 0.5, 12, 90], [1.5, 0.8, 82, 70], [1, 0.9, 58, 42], [1, 0.6, 28, 35],
]

export function LoginBackground() {
  const starGradients = stars
    .map(
      ([size, opacity, left, top]) =>
        `radial-gradient(${size}px ${size}px at ${left}% ${top}%, rgba(255,255,255,${opacity}), transparent)`,
    )
    .join(",")

  return (
    <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#4fc3f7] to-[#fff] dark:from-[#0f0c29] dark:to-[#302b63]">
      <div
        className="absolute inset-0 opacity-0 dark:opacity-100 transition-opacity duration-700"
        style={{ backgroundImage: starGradients }}
      />
    </div>
  )
}
