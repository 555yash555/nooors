import SiteContentModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const SITE_CONTENT_MODULE = "siteContent"

export default Module(SITE_CONTENT_MODULE, {
  service: SiteContentModuleService,
})
