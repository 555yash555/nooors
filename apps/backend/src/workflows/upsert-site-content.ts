import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { upsertSiteContentStep } from "./steps/upsert-site-content"

type Input = {
  key: string
  data: Record<string, unknown>
}

const upsertSiteContentWorkflow = createWorkflow(
  "upsert-site-content",
  function (input: Input) {
    const entry = upsertSiteContentStep(input)

    return new WorkflowResponse({ entry })
  }
)

export default upsertSiteContentWorkflow
