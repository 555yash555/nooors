import { Label, RadioGroup, clx } from "@modules/common/components/ui"

type FilterRadioGroupProps = {
  title: string
  items: {
    value: string
    label: string
  }[]
  value: string
  handleChange: (value: string) => void
  "data-testid"?: string
}

/**
 * NOOORS filter group — minimal, gold tick on selected item, all uppercase tracked.
 */
const FilterRadioGroup = ({
  title,
  items,
  value,
  handleChange,
  "data-testid": dataTestId,
}: FilterRadioGroupProps) => {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-[0.65rem] tracking-[0.3em] uppercase text-gold mb-2">
        {title}
      </span>
      <RadioGroup data-testid={dataTestId} className="flex flex-col gap-3">
        {items?.map((i) => {
          const active = i.value === value
          return (
            <div key={i.value} className="flex items-center gap-3">
              <RadioGroup.Item
                checked={active}
                onChange={() => handleChange(i.value)}
                className="hidden peer"
                id={i.value}
                value={i.value}
              />
              <Label
                htmlFor={i.value}
                className={clx(
                  "cursor-pointer text-[0.72rem] tracking-[0.22em] uppercase transition-colors duration-300 ease-silk",
                  "relative pl-5",
                  active ? "text-ink" : "text-smoke hover:text-ink"
                )}
                data-testid="radio-label"
                data-active={active}
              >
                <span
                  className={clx(
                    "absolute left-0 top-1/2 -translate-y-1/2 w-2 h-px transition-all duration-300 ease-silk",
                    active ? "bg-gold w-3" : "bg-smoke/40"
                  )}
                />
                {i.label}
              </Label>
            </div>
          )
        })}
      </RadioGroup>
    </div>
  )
}

export default FilterRadioGroup
