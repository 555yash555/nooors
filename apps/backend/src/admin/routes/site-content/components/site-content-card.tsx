import { useEffect, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Button,
  Container,
  Drawer,
  Heading,
  Input,
  Label,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { PencilSquare } from "@medusajs/icons"
import { sdk } from "../../../lib/client"

export type SiteContentField = {
  name: string
  label: string
  type: "text" | "textarea" | "url"
}

type Props = {
  title: string
  description: string
  entryKey: string
  fields: SiteContentField[]
  data: Record<string, unknown> | undefined
}

/**
 * One editable "section" of site content — displays the current values as
 * plain text, with an Edit button that opens a Drawer form. Saves via
 * `POST /admin/site-content/:key` (upsert-by-key), then invalidates the
 * shared site-content query so every card + the storefront-facing data all
 * reflect the change.
 */
const SiteContentCard = ({
  title,
  description,
  entryKey,
  fields,
  data,
}: Props) => {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const queryClient = useQueryClient()

  // Re-seed form state from the latest saved data whenever the drawer opens.
  useEffect(() => {
    if (!open) return
    const initial: Record<string, string> = {}
    fields.forEach((f) => {
      initial[f.name] = (data?.[f.name] as string) ?? ""
    })
    setFormData(initial)
  }, [open, data, fields])

  const save = useMutation({
    mutationFn: (payload: Record<string, string>) =>
      sdk.client.fetch(`/admin/site-content/${entryKey}`, {
        method: "POST",
        body: { data: payload },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-content"] })
      toast.success(`${title} updated`)
      setOpen(false)
    },
    onError: (error: any) => {
      toast.error(error?.message ?? `Failed to update ${title}`)
    },
  })

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">{title}</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            {description}
          </Text>
        </div>
        <Button size="small" variant="secondary" onClick={() => setOpen(true)}>
          <PencilSquare />
          Edit
        </Button>
      </div>

      <div className="px-6 py-4 flex flex-col gap-y-3">
        {fields.map((f) => (
          <div key={f.name} className="flex flex-col gap-y-1">
            <Text size="small" leading="compact" weight="plus">
              {f.label}
            </Text>
            <Text size="small" className="text-ui-fg-subtle break-words">
              {(data?.[f.name] as string) || (
                <span className="italic">Not set</span>
              )}
            </Text>
          </div>
        ))}
      </div>

      <Drawer open={open} onOpenChange={setOpen}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Edit {title}</Drawer.Title>
          </Drawer.Header>

          <Drawer.Body className="flex-1 overflow-auto p-4">
            <div className="flex flex-col gap-y-4">
              {fields.map((f) => (
                <div key={f.name} className="flex flex-col gap-y-2">
                  <Label>{f.label}</Label>
                  {f.type === "textarea" ? (
                    <Textarea
                      rows={4}
                      value={formData[f.name] ?? ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          [f.name]: e.target.value,
                        }))
                      }
                    />
                  ) : (
                    <Input
                      value={formData[f.name] ?? ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          [f.name]: e.target.value,
                        }))
                      }
                    />
                  )}
                </div>
              ))}
            </div>
          </Drawer.Body>

          <Drawer.Footer>
            <div className="flex items-center justify-end gap-x-2">
              <Drawer.Close asChild>
                <Button
                  size="small"
                  variant="secondary"
                  disabled={save.isPending}
                >
                  Cancel
                </Button>
              </Drawer.Close>
              <Button
                size="small"
                onClick={() => save.mutate(formData)}
                isLoading={save.isPending}
              >
                Save
              </Button>
            </div>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </Container>
  )
}

export default SiteContentCard
