import { HTMLAttributes, ReactNode, SVGAttributes } from "react"
import clsx from "clsx"

/**
 * Elora — shared presentational primitives.
 * Pure server-renderable; no client behaviour.
 */

/* ---------- SECTION HEADER ---------- */
export function SectionHeader({
  label,
  title,
  sub,
  light,
  ornament = true,
  className,
}: {
  label?: string
  title: ReactNode
  sub?: ReactNode
  light?: boolean
  ornament?: boolean
  className?: string
}) {
  return (
    <div
      suppressHydrationWarning
      className={clsx(
        "section-header text-center mx-auto max-w-3xl",
        className
      )}
    >
      {label && (
        <span
          className={clsx("section-label", light && "section-label--light")}
        >
          {label}
        </span>
      )}
      <h2
        suppressHydrationWarning
        className="section-title mt-6"
        data-split
      >
        {title}
      </h2>
      {sub && <p className="section-sub mt-4">{sub}</p>}
      {ornament && (
        <div
          suppressHydrationWarning
          className={clsx("ornament", light && "ornament--light")}
        >
          <span className="ornament__line" />
          <span className="ornament__diamond" />
          <span className="ornament__line" />
        </div>
      )}
    </div>
  )
}

/* ---------- ORNAMENT ---------- */
export function Ornament({
  light,
  className,
}: {
  light?: boolean
  className?: string
}) {
  return (
    <div className={clsx("ornament", light && "ornament--light", className)}>
      <span className="ornament__line" />
      <span className="ornament__diamond" />
      <span className="ornament__line" />
    </div>
  )
}

/* ---------- MARQUEE ---------- */
export function Marquee({
  items,
}: {
  items: string[]
}) {
  // duplicate for seamless loop
  const loop = [...items, ...items]
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">
        {loop.map((it, i) => (
          <span key={i} className="inline-flex items-center gap-12">
            <span>{it}</span>
            <span className="marquee__dot">·</span>
          </span>
        ))}
      </div>
    </div>
  )
}

/* ---------- FLOAT ACCENTS (decorative SVGs) ---------- */
export function FloatAccentCircles({
  className,
  style,
  size = 60,
}: {
  className?: string
  style?: React.CSSProperties
  size?: number
}) {
  return (
    <svg
      className={clsx("float-accent", className)}
      style={{ width: size, height: size, ...style }}
      viewBox="0 0 60 60"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle
        cx="30"
        cy="30"
        r="28"
        fill="none"
        stroke="rgba(232,212,168,0.5)"
        strokeWidth="0.5"
      />
      <circle
        cx="30"
        cy="30"
        r="20"
        fill="none"
        stroke="rgba(232,212,168,0.35)"
        strokeWidth="0.5"
      />
      <circle cx="30" cy="30" r="2" fill="rgba(232,212,168,0.8)" />
    </svg>
  )
}

export function FloatAccentStar({
  className,
  style,
  size = 44,
}: {
  className?: string
  style?: React.CSSProperties
  size?: number
}) {
  return (
    <svg
      className={clsx("float-accent", className)}
      style={{ width: size, height: size, ...style }}
      viewBox="0 0 44 44"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M22 2 L26 18 L42 22 L26 26 L22 42 L18 26 L2 22 L18 18 Z"
        fill="none"
        stroke="rgba(212,183,135,0.5)"
        strokeWidth="0.6"
      />
    </svg>
  )
}

export function CornerBracket({
  position = "tl",
  className,
  size = 60,
}: {
  position?: "tl" | "br"
  className?: string
  size?: number
}) {
  const tl = "M2 20 L2 2 L20 2"
  const br = "M58 40 L58 58 L40 58"
  return (
    <svg
      className={clsx("float-accent", className)}
      style={{ width: size, height: size, opacity: 0.8 }}
      viewBox="0 0 60 60"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d={position === "tl" ? tl : br}
        fill="none"
        stroke="rgba(232,212,168,0.9)"
        strokeWidth="1"
      />
    </svg>
  )
}

/* ---------- DRAW LINE ---------- */
export function DrawLine({
  className,
  width = 180,
  height = 40,
  stroke = "rgba(232,212,168,0.7)",
}: {
  className?: string
  width?: number
  height?: number
  stroke?: string
}) {
  return (
    <svg
      className={clsx("draw-line", className)}
      style={{ width, height, display: "block" }}
      viewBox="0 0 180 40"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M4 28 C 30 8, 60 8, 90 22 S 150 36, 176 14"
        fill="none"
        stroke={stroke}
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  )
}
