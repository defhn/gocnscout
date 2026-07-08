export const mediaAssets = {
  bentoClusterCost: "/media/generated/bento-cluster-cost.webp",
  bentoLogisticsPort: "/media/generated/bento-logistics-port.webp",
  bentoSkilledLabor: "/media/generated/bento-skilled-labor.webp",
  cityHardwareMachineryUnderlay: "/media/generated/city-hardware-machinery-underlay.webp",
  cityHomeApplianceFactoryUnderlay: "/media/generated/city-home-appliance-factory-underlay.webp",
  cityIndustrialClusterAerial: "/media/generated/city-industrial-cluster-aerial.webp",
  cityLightIndustryUnderlay: "/media/generated/city-light-industry-underlay.webp",
  cityPortManufacturingUnderlay: "/media/generated/city-port-manufacturing-underlay.webp",
  cityTechParkUnderlay: "/media/generated/city-tech-park-underlay.webp",
  directoryCityHeatmap: "/media/generated/directory-city-heatmap.webp",
  directoryIndustryMatrix: "/media/generated/directory-industry-matrix.webp",
  industryTrendReport: "/media/generated/industry-trend-report.webp",
  lockedSpreadsheetPreview: "/media/generated/locked-spreadsheet-preview.webp",
  signalCapitalRegistration: "/media/generated/signal-capital-registration.webp",
  signalExhibitionStability: "/media/generated/signal-exhibition-stability.webp",
  signalWebsiteVerification: "/media/generated/signal-website-verification.webp",
  workflowApplyFilters: "/media/generated/workflow-apply-filters.webp",
  workflowDirectVetting: "/media/generated/workflow-direct-vetting.webp",
  workflowInspectProfile: "/media/generated/workflow-inspect-profile.webp",
  workflowSelectCategory: "/media/generated/workflow-select-category.webp",
} as const;

export type MediaAssetKey = keyof typeof mediaAssets;

export function getCityUnderlayAsset(input: string) {
  const value = input.toLowerCase();

  if (/(shenzhen|dongguan|electronics|electronic|technology|tech|smart|iot|pcb|consumer electronics)/.test(value)) {
    return mediaAssets.cityTechParkUnderlay;
  }

  if (/(shunde|appliance|appliances|kitchen|home appliance|air conditioner|washing|refrigeration)/.test(value)) {
    return mediaAssets.cityHomeApplianceFactoryUnderlay;
  }

  if (/(yongkang|hardware|machinery|machine|tool|tools|fastener|metal|cnc|industrial parts)/.test(value)) {
    return mediaAssets.cityHardwareMachineryUnderlay;
  }

  if (/(textile|garment|apparel|fashion|light industry|fabric|shaoxing|quanzhou)/.test(value)) {
    return mediaAssets.cityLightIndustryUnderlay;
  }

  return mediaAssets.cityPortManufacturingUnderlay;
}
