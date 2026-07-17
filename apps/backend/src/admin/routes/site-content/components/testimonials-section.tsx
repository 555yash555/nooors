import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Badge,
  Button,
  Container,
  Drawer,
  FocusModal,
  Heading,
  IconButton,
  Input,
  Label,
  Switch,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { PencilSquare, Plus, Trash } from "@medusajs/icons"
import { sdk } from "../../../lib/client"

type Testimonial = {
  id: string
  quote: string
  citation: string
  sort_order: number
  is_active: boolean
}

const emptyForm = { quote: "", citation: "", sort_order: 0, is_active: true }

/**
 * Homepage press/client quotes — add, edit, reorder (via sort_order),
 * activate/deactivate, delete. Single display query (loads on mount);
 * create/edit each have their own form state, invalidated together after
 * any mutation.
 */
const TestimonialsSection = () => {
  const queryClient = useQueryClient()

  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState(emptyForm)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState(emptyForm)

  // Display query — loads on mount, no conditional `enabled`.
  const { data, isLoading } = useQuery({
    queryFn: () =>
      sdk.client.fetch<{ testimonials: Testimonial[] }>(
        "/admin/testimonials"
      ),
    queryKey: ["testimonials"],
  })

  const testimonials = data?.testimonials ?? []

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["testimonials"] })

  const createMutation = useMutation({
    mutationFn: (payload: typeof emptyForm) =>
      sdk.client.fetch("/admin/testimonials", {
        method: "POST",
        body: payload,
      }),
    onSuccess: () => {
      invalidate()
      toast.success("Testimonial added")
      setCreateOpen(false)
      setCreateForm(emptyForm)
    },
    onError: (error: any) => {
      toast.error(error?.message ?? "Failed to add testimonial")
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & typeof emptyForm) =>
      sdk.client.fetch(`/admin/testimonials/${id}`, {
        method: "POST",
        body: payload,
      }),
    onSuccess: () => {
      invalidate()
      toast.success("Testimonial updated")
      setEditingId(null)
    },
    onError: (error: any) => {
      toast.error(error?.message ?? "Failed to update testimonial")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      sdk.client.fetch(`/admin/testimonials/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      invalidate()
      toast.success("Testimonial deleted")
    },
    onError: (error: any) => {
      toast.error(error?.message ?? "Failed to delete testimonial")
    },
  })

  const openEdit = (t: Testimonial) => {
    setEditingId(t.id)
    setEditForm({
      quote: t.quote,
      citation: t.citation,
      sort_order: t.sort_order,
      is_active: t.is_active,
    })
  }

  const editingTestimonial = testimonials.find((t) => t.id === editingId)

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">Testimonials</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Press mentions and client quotes shown on the homepage.
          </Text>
        </div>
        <Button size="small" variant="secondary" onClick={() => setCreateOpen(true)}>
          <Plus />
          Add
        </Button>
      </div>

      <div className="px-6 py-4">
        {isLoading && (
          <Text size="small" className="text-ui-fg-subtle">
            Loading…
          </Text>
        )}

        {!isLoading && testimonials.length === 0 && (
          <Text size="small" className="text-ui-fg-subtle">
            No testimonials yet.
          </Text>
        )}

        <div className="flex flex-col gap-y-3">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="shadow-elevation-card-rest bg-ui-bg-component rounded-md px-4 py-3"
            >
              <div className="flex items-start justify-between gap-x-3">
                <div className="flex-1 min-w-0">
                  <Text size="small" leading="compact" className="italic">
                    "{t.quote}"
                  </Text>
                  <div className="flex items-center gap-x-2 mt-1.5">
                    <Text
                      size="small"
                      leading="compact"
                      className="text-ui-fg-subtle"
                    >
                      {t.citation}
                    </Text>
                    {!t.is_active && (
                      <Badge size="2xsmall" color="grey">
                        Hidden
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-x-1 shrink-0">
                  <IconButton
                    size="small"
                    variant="transparent"
                    onClick={() => openEdit(t)}
                  >
                    <PencilSquare />
                  </IconButton>
                  <IconButton
                    size="small"
                    variant="transparent"
                    onClick={() => deleteMutation.mutate(t.id)}
                  >
                    <Trash />
                  </IconButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CREATE */}
      <FocusModal open={createOpen} onOpenChange={setCreateOpen}>
        <FocusModal.Content>
          <div className="flex h-full flex-col overflow-hidden">
            <FocusModal.Header>
              <div className="flex items-center justify-end gap-x-2">
                <FocusModal.Close asChild>
                  <Button
                    size="small"
                    variant="secondary"
                    disabled={createMutation.isPending}
                  >
                    Cancel
                  </Button>
                </FocusModal.Close>
                <Button
                  size="small"
                  onClick={() => createMutation.mutate(createForm)}
                  isLoading={createMutation.isPending}
                >
                  Save
                </Button>
              </div>
            </FocusModal.Header>
            <FocusModal.Body className="flex-1 overflow-auto">
              <div className="flex flex-col gap-y-4 max-w-lg mx-auto py-8">
                <div className="flex flex-col gap-y-2">
                  <Label>Quote *</Label>
                  <Textarea
                    rows={3}
                    value={createForm.quote}
                    onChange={(e) =>
                      setCreateForm((p) => ({ ...p, quote: e.target.value }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-y-2">
                  <Label>Citation *</Label>
                  <Input
                    placeholder="— Publication, Date or — Name, Title"
                    value={createForm.citation}
                    onChange={(e) =>
                      setCreateForm((p) => ({
                        ...p,
                        citation: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-y-2">
                  <Label>Sort order</Label>
                  <Input
                    type="number"
                    value={createForm.sort_order}
                    onChange={(e) =>
                      setCreateForm((p) => ({
                        ...p,
                        sort_order: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="flex items-center gap-x-2">
                  <Switch
                    checked={createForm.is_active}
                    onCheckedChange={(checked) =>
                      setCreateForm((p) => ({ ...p, is_active: checked }))
                    }
                  />
                  <Label>Active</Label>
                </div>
              </div>
            </FocusModal.Body>
          </div>
        </FocusModal.Content>
      </FocusModal>

      {/* EDIT */}
      <Drawer
        open={!!editingId}
        onOpenChange={(open) => !open && setEditingId(null)}
      >
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Edit Testimonial</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body className="flex-1 overflow-auto p-4">
            <div className="flex flex-col gap-y-4">
              <div className="flex flex-col gap-y-2">
                <Label>Quote</Label>
                <Textarea
                  rows={3}
                  value={editForm.quote}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, quote: e.target.value }))
                  }
                />
              </div>
              <div className="flex flex-col gap-y-2">
                <Label>Citation</Label>
                <Input
                  value={editForm.citation}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, citation: e.target.value }))
                  }
                />
              </div>
              <div className="flex flex-col gap-y-2">
                <Label>Sort order</Label>
                <Input
                  type="number"
                  value={editForm.sort_order}
                  onChange={(e) =>
                    setEditForm((p) => ({
                      ...p,
                      sort_order: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div className="flex items-center gap-x-2">
                <Switch
                  checked={editForm.is_active}
                  onCheckedChange={(checked) =>
                    setEditForm((p) => ({ ...p, is_active: checked }))
                  }
                />
                <Label>Active</Label>
              </div>
            </div>
          </Drawer.Body>
          <Drawer.Footer>
            <div className="flex items-center justify-end gap-x-2">
              <Drawer.Close asChild>
                <Button
                  size="small"
                  variant="secondary"
                  disabled={updateMutation.isPending}
                >
                  Cancel
                </Button>
              </Drawer.Close>
              <Button
                size="small"
                isLoading={updateMutation.isPending}
                onClick={() =>
                  editingTestimonial &&
                  updateMutation.mutate({ id: editingTestimonial.id, ...editForm })
                }
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

export default TestimonialsSection
