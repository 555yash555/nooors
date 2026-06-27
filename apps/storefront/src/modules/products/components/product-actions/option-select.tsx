import { HttpTypes } from "@medusajs/types"
import { clx } from "@modules/common/components/ui"
import React from "react"

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (title: string, value: string) => void
  title: string
  disabled: boolean
  colorSwatches?: { name: string; hex: string }[]
  "data-testid"?: string
}

/**
 * NOOORS OptionSelect.
 * - "Color" renders as round swatches (uses metadata.color_swatches if provided).
 * - Any other option (Size etc) renders as square box buttons.
 */
const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  colorSwatches,
  "data-testid": dataTestId,
  disabled,
}) => {
  const values = (option.values ?? []).map((v) => v.value)
  const isColor = title.toLowerCase() === "color"

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[0.65rem] tracking-[0.3em] uppercase text-gold">
          {title}
        </span>
        {current && (
          <span className="text-[0.7rem] tracking-[0.15em] uppercase text-smoke">
            {current}
          </span>
        )}
      </div>

      <div
        className={clx(
          isColor
            ? "flex flex-wrap gap-3 items-center"
            : "grid grid-cols-5 gap-2 sm:flex sm:flex-wrap sm:gap-3"
        )}
        data-testid={dataTestId}
      >
        {values.map((v) => {
          const swatch = isColor
            ? colorSwatches?.find(
                (c) => c.name.toLowerCase() === v.toLowerCase()
              )
            : null

          if (isColor) {
            return (
              <button
                key={v}
                onClick={() => updateOption(option.id, v)}
                disabled={disabled}
                aria-label={v}
                title={v}
                data-testid="option-button"
                className={clx(
                  "color-dot relative w-7 h-7 rounded-full border transition-transform duration-300 ease-silk",
                  v === current
                    ? "border-gold scale-110 ring-1 ring-gold ring-offset-2 ring-offset-ivory"
                    : "border-ink/10 hover:scale-110"
                )}
                style={{
                  background: swatch?.hex || "#999",
                }}
              />
            )
          }

          return (
            <button
              key={v}
              onClick={() => updateOption(option.id, v)}
              disabled={disabled}
              data-testid="option-button"
              className={clx(
                "min-w-[48px] h-12 px-3 border font-sans text-[0.72rem] tracking-[0.18em] uppercase",
                "transition-all duration-300 ease-silk relative",
                v === current
                  ? "bg-ink text-ivory border-ink shadow-[inset_0_0_0_2px_var(--gold)]"
                  : "bg-transparent text-ink border-ink/20 hover:border-ink"
              )}
            >
              {v}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default OptionSelect
