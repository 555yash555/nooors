"use client"

import * as Accordion from "@radix-ui/react-accordion"
import { useEffect, useState } from "react"

import { ChevronDownMini } from "@medusajs/icons"
import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import clsx from "clsx"

type OptionsPickerProps = {
  selectedValueIds: string[]
  setOptionValueIds: (valueIds: string[]) => void
  /**
   * When provided, the picker uses these options directly instead of
   * fetching the global `/store/product-options` set — lets each listing
   * surface (store / collection / category) show only the options that
   * actually apply to its products.
   */
  availableOptions?: HttpTypes.StoreProductOption[]
}

const OptionsPicker = ({
  selectedValueIds,
  setOptionValueIds,
  availableOptions,
}: OptionsPickerProps) => {
  const [options, setOptions] = useState<HttpTypes.StoreProductOption[]>(
    availableOptions ?? []
  )
  const [openItems, setOpenItems] = useState<string[]>([])

  useEffect(() => {
    if (availableOptions) {
      setOptions(availableOptions)
      return
    }
    const fetchOptions = async () => {
      try {
        const response = await sdk.client.fetch<{
          product_options?: HttpTypes.StoreProductOption[]
        }>("/store/product-options", {
          method: "GET",
          query: {
            is_exclusive: false,
            fields: "*values",
          },
        })

        if (response?.product_options) {
          setOptions(response.product_options)
        }
      } catch (error) {
        console.error("Failed to fetch product options", error)
      }
    }

    fetchOptions()
  }, [availableOptions])

  useEffect(() => {
    if (options.length) {
      setOpenItems(options.map((option) => option.id))
    }
  }, [options])

  if (!options.length) {
    return null
  }

  return (
    <div className="flex flex-col gap-y-4">
      <span className="text-[0.65rem] tracking-[0.3em] uppercase text-gold mb-2">
        Filter
      </span>
      <Accordion.Root
        type="multiple"
        value={openItems}
        onValueChange={(values) => setOpenItems(values as string[])}
        className="flex flex-col"
      >
        {options.map((option) => {
          const values =
            option.values
              ?.map((value) => ({
                id: value.id,
                label: value.value,
              }))
              .filter(
                (value): value is { id: string; label: string } =>
                  !!value.id && !!value.label
              ) || []

          if (!values.length) {
            return null
          }

          const toggleValue = (valueId: string) => {
            const isSelected = selectedValueIds.includes(valueId)
            const nextSelections = isSelected
              ? selectedValueIds.filter((id) => id !== valueId)
              : [...selectedValueIds, valueId]

            setOptionValueIds(Array.from(new Set(nextSelections)))
          }

          const isOpen = openItems.includes(option.id)
          const selectedCount = values.filter((value) =>
            selectedValueIds.includes(value.id)
          ).length

          return (
            <Accordion.Item
              key={option.id}
              value={option.id}
              className="overflow-hidden border-b border-gold/15 last:border-b-0"
            >
              <Accordion.Header>
                <Accordion.Trigger className="flex w-full items-center justify-between py-4 text-left group">
                  <span className="flex items-baseline gap-2">
                    <span className="text-[0.72rem] tracking-[0.22em] uppercase text-ink">
                      {option.title || "Option"}
                    </span>
                    {selectedCount > 0 && (
                      <span className="text-[0.65rem] tracking-[0.18em] text-gold tabular-nums">
                        {selectedCount}
                      </span>
                    )}
                  </span>
                  <span
                    className={clsx(
                      "flex h-6 w-6 items-center justify-center text-ink/70 transition-transform duration-300 ease-silk",
                      {
                        "rotate-180": isOpen,
                      }
                    )}
                  >
                    <ChevronDownMini />
                  </span>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="pb-5 pt-1">
                <div className="grid grid-cols-3 gap-2">
                  {values.map((value) => {
                    const isSelected = selectedValueIds.includes(value.id)

                    return (
                      <button
                        key={value.id}
                        onClick={() => toggleValue(value.id)}
                        className={clsx(
                          "border h-10 px-2 text-[0.7rem] tracking-[0.18em] uppercase truncate",
                          "transition-colors duration-300 ease-silk",
                          isSelected
                            ? "border-ink bg-ink text-ivory"
                            : "border-ink/20 text-smoke hover:border-ink hover:text-ink"
                        )}
                        aria-pressed={isSelected}
                      >
                        {value.label}
                      </button>
                    )
                  })}
                </div>
              </Accordion.Content>
            </Accordion.Item>
          )
        })}
      </Accordion.Root>
    </div>
  )
}

export default OptionsPicker
