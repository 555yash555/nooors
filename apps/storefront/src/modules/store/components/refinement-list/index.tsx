"use client"

import { Dialog, Transition } from "@headlessui/react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Fragment, useCallback, useMemo, useState } from "react"

import {
  OPTION_VALUE_QUERY_KEY,
  parseOptionValueIds,
} from "@lib/util/product-option-filters"
import OptionsPicker from "./options-picker"
import SortProducts, { SortOptions } from "./sort-products"
import { HttpTypes } from "@medusajs/types"

type RefinementListProps = {
  sortBy: SortOptions
  search?: boolean
  hideOptionsPicker?: boolean
  availableOptions?: HttpTypes.StoreProductOption[]
  "data-testid"?: string
}

/**
 * Elora RefinementList.
 *
 * Desktop (lg+): vertical sidebar — Sort radio group + Options accordion.
 * Mobile  (< lg): sticky two-pill bar (Sort | Filter) under the nav that
 *                 opens a bottom-sheet refine panel. Tab inside the sheet
 *                 switches between Sort and Filter. "Show Results" closes.
 */
const RefinementList = ({
  sortBy,
  hideOptionsPicker = false,
  availableOptions,
  "data-testid": dataTestId,
}: RefinementListProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [sheetTab, setSheetTab] = useState<"sort" | "filter" | null>(null)
  const close = () => setSheetTab(null)

  const updateQueryParams = useCallback(
    (updater: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString())
      updater(params)

      params.delete("page")

      const queryString = params.toString()
      const currentQuery = searchParams.toString()
      const nextPath = queryString ? `${pathname}?${queryString}` : pathname
      const currentPath = currentQuery
        ? `${pathname}?${currentQuery}`
        : pathname

      if (nextPath !== currentPath) {
        router.push(nextPath)
      }
    },
    [pathname, router, searchParams]
  )

  const setQueryParams = (name: string, value: string) =>
    updateQueryParams((params) => params.set(name, value))

  const selectedOptionValueIds = useMemo(
    () => parseOptionValueIds(searchParams),
    [searchParams]
  )

  const setOptionValueIds = (valueIds: string[]) =>
    updateQueryParams((params) => {
      params.delete(OPTION_VALUE_QUERY_KEY)
      valueIds.forEach((valueId) =>
        params.append(OPTION_VALUE_QUERY_KEY, valueId)
      )
    })

  const activeFilterCount = selectedOptionValueIds.length

  // Hide the picker entirely when this listing's context yields zero options
  // (e.g. a category with one product whose options aren't filterable here).
  // Falls through to the existing fetch when availableOptions is undefined.
  const showFilterPicker =
    !hideOptionsPicker &&
    (availableOptions === undefined || availableOptions.length > 0)

  return (
    <>
      {/* DESKTOP — sidebar pinned below the fixed nav so it stays visible
          as the product grid scrolls. self-start keeps the sticky box from
          stretching to the grid's full height; max-h + overflow handles the
          edge case where the filter list is taller than the viewport. */}
      <aside className="hidden lg:flex lg:flex-col lg:gap-12 lg:min-w-[220px] lg:py-4 lg:sticky lg:top-28 lg:self-start lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
        <SortProducts
          sortBy={sortBy}
          setQueryParams={setQueryParams}
          data-testid={dataTestId}
        />
        {showFilterPicker && (
          <OptionsPicker
            selectedValueIds={selectedOptionValueIds}
            setOptionValueIds={setOptionValueIds}
            availableOptions={availableOptions}
          />
        )}
      </aside>

      {/* MOBILE — sticky pill bar */}
      <div
        className="lg:hidden sticky top-20 z-30"
        style={{
          marginLeft: "calc(var(--pad-x) * -1)",
          marginRight: "calc(var(--pad-x) * -1)",
        }}
      >
        <div className="flex bg-ivory/95 backdrop-blur-sm border-y border-gold/15">
          <button
            type="button"
            onClick={() => setSheetTab("sort")}
            className={`flex-1 py-4 text-[0.62rem] tracking-[0.3em] uppercase text-ink flex items-center justify-center gap-2 active:bg-bone transition-colors ${
              showFilterPicker ? "border-r border-gold/15" : ""
            }`}
          >
            Sort
          </button>
          {showFilterPicker && (
            <button
              type="button"
              onClick={() => setSheetTab("filter")}
              className="flex-1 py-4 text-[0.62rem] tracking-[0.3em] uppercase text-ink flex items-center justify-center gap-2 active:bg-bone transition-colors"
            >
              Filter
              {activeFilterCount > 0 && (
                <span className="text-gold tabular-nums">
                  · {activeFilterCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* MOBILE — bottom sheet */}
      <Transition show={sheetTab !== null} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[70] lg:hidden"
          onClose={close}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-silk duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-silk duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-ink/55 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed bottom-0 inset-x-0">
            <Transition.Child
              as={Fragment}
              enter="ease-silk duration-400"
              enterFrom="translate-y-full"
              enterTo="translate-y-0"
              leave="ease-silk duration-300"
              leaveFrom="translate-y-0"
              leaveTo="translate-y-full"
            >
              <Dialog.Panel className="bg-ivory rounded-t-2xl max-h-[85vh] flex flex-col">
                {/* Drag handle */}
                <div className="flex justify-center pt-2.5 pb-1">
                  <div className="w-12 h-1 bg-ink/15 rounded-full" />
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gold/15 mt-2">
                  <button
                    type="button"
                    onClick={() => setSheetTab("sort")}
                    className={`flex-1 py-4 text-[0.62rem] tracking-[0.3em] uppercase transition-colors ${
                      sheetTab === "sort"
                        ? "text-ink border-b-2 border-gold"
                        : "text-smoke"
                    }`}
                  >
                    Sort
                  </button>
                  {showFilterPicker && (
                    <button
                      type="button"
                      onClick={() => setSheetTab("filter")}
                      className={`flex-1 py-4 text-[0.62rem] tracking-[0.3em] uppercase transition-colors ${
                        sheetTab === "filter"
                          ? "text-ink border-b-2 border-gold"
                          : "text-smoke"
                      }`}
                    >
                      Filter
                      {activeFilterCount > 0 && (
                        <span className="text-gold ml-1.5 tabular-nums">
                          · {activeFilterCount}
                        </span>
                      )}
                    </button>
                  )}
                </div>

                {/* Content — keep both tabs mounted, just hide the inactive
                    one so OptionsPicker doesn't re-fetch every toggle. */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                  <div className={sheetTab === "sort" ? "block" : "hidden"}>
                    <SortProducts
                      sortBy={sortBy}
                      setQueryParams={setQueryParams}
                      data-testid={dataTestId}
                    />
                  </div>
                  {showFilterPicker && (
                    <div
                      className={sheetTab === "filter" ? "block" : "hidden"}
                    >
                      <OptionsPicker
                        selectedValueIds={selectedOptionValueIds}
                        setOptionValueIds={setOptionValueIds}
                        availableOptions={availableOptions}
                      />
                    </div>
                  )}
                </div>

                {/* Footer CTA */}
                <div
                  className="px-6 pt-4 border-t border-gold/15"
                  style={{
                    paddingBottom: "calc(1rem + env(safe-area-inset-bottom))",
                  }}
                >
                  <button
                    type="button"
                    onClick={close}
                    className="w-full bg-ink text-ivory py-4 text-[0.7rem] tracking-[0.3em] uppercase hover:bg-graphite transition-colors"
                  >
                    Show Results
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

export default RefinementList
