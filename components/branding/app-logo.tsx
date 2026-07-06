import { cn } from "@/lib/utils"

interface AppLogoProps {
  className?: string
  iconClassName?: string
  showWordmark?: boolean
}

export function AppLogo({
  className,
  iconClassName,
  showWordmark = true,
}: AppLogoProps) {
  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      <svg
        aria-hidden="true"
        viewBox="0 0 180 180"
        className={cn("size-10 shrink-0", iconClassName)}
        fill="none"
      >
        <g transform="translate(90 98) scale(1.22) translate(-90 -98)">
          <path
            d="M46 77L90 48L134 77V132C134 140.284 127.284 147 119 147H61C52.716 147 46 140.284 46 132V77Z"
            className="fill-secondary"
          />
          <path
            d="M46 78L90 48L134 78"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-foreground"
          />
          <path
            d="M57 86V132C57 134.209 58.791 136 61 136H119C121.209 136 123 134.209 123 132V86"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
            className="text-foreground"
          />
          <path
            d="M73 95H107"
            stroke="currentColor"
            strokeWidth="9"
            strokeLinecap="round"
            className="text-foreground"
          />
          <path
            d="M73 116H98"
            stroke="currentColor"
            strokeWidth="9"
            strokeLinecap="round"
            className="text-foreground"
          />
          <path
            d="M103 124C103 112.954 111.954 104 123 104C123 115.046 114.046 124 103 124Z"
            fill="#D6A935"
          />
          <circle cx="103" cy="124" r="6" className="fill-foreground" />
        </g>
      </svg>
      {showWordmark && (
        <span className="text-xl font-semibold tracking-normal text-foreground">
          Trojes
        </span>
      )}
    </div>
  )
}
