import { Text, clx } from "@modules/common/components/ui"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import React from "react"

type AccordionItemProps = AccordionPrimitive.AccordionItemProps & {
  title: string
  subtitle?: string
  description?: string
  required?: boolean
  tooltip?: string
  forceMountContent?: true
  headingSize?: "small" | "medium" | "large"
  customTrigger?: React.ReactNode
  complete?: boolean
  active?: boolean
  triggerable?: boolean
  children: React.ReactNode
}

type AccordionProps =
  | (AccordionPrimitive.AccordionSingleProps &
      React.RefAttributes<HTMLDivElement>)
  | (AccordionPrimitive.AccordionMultipleProps &
      React.RefAttributes<HTMLDivElement>)

const Accordion: React.FC<AccordionProps> & {
  Item: React.FC<AccordionItemProps>
} = ({ children, ...props }) => {
  return (
    <AccordionPrimitive.Root {...props}>{children}</AccordionPrimitive.Root>
  )
}

const Item: React.FC<AccordionItemProps> = ({
  title,
  subtitle,
  description,
  children,
  className,
  headingSize: _headingSize = "large",
  customTrigger = undefined,
  forceMountContent = undefined,
  triggerable: _triggerable,
  ...props
}) => {
  return (
    <AccordionPrimitive.Item
      {...props}
      className={clx(
        "border-ink/10 group border-t last:mb-0 last:border-b",
        "py-4",
        className
      )}
    >
      <AccordionPrimitive.Header className="px-1">
        <AccordionPrimitive.Trigger className="w-full">
          <div className="flex w-full items-center justify-between">
            <span className="text-[0.72rem] tracking-[0.25em] uppercase text-ink font-sans">
              {title}
            </span>
            {customTrigger || <MorphingTrigger />}
          </div>
          {subtitle && (
            <Text as="span" className="mt-1 text-sm text-smoke">
              {subtitle}
            </Text>
          )}
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content
        forceMount={forceMountContent}
        className={clx(
          "radix-state-closed:animate-accordion-close radix-state-open:animate-accordion-open radix-state-closed:pointer-events-none px-1"
        )}
      >
        <div className="inter-base-regular group-radix-state-closed:animate-accordion-close">
          {description && <Text>{description}</Text>}
          <div className="w-full">{children}</div>
        </div>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  )
}

Accordion.Item = Item

const MorphingTrigger = () => {
  return (
    <div className="text-gold bg-transparent group relative p-1.5">
      <div className="h-4 w-4">
        <span className="bg-gold rounded-full group-radix-state-open:rotate-90 absolute inset-y-[31.75%] left-[48%] right-1/2 w-[1px] duration-300" />
        <span className="bg-gold rounded-full group-radix-state-open:rotate-90 group-radix-state-open:left-1/2 group-radix-state-open:right-1/2 absolute inset-x-[31.75%] top-[48%] bottom-1/2 h-[1px] duration-300" />
      </div>
    </div>
  )
}

export default Accordion
