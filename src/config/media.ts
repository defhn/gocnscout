export const mediaAssets = {
  bentoClusterCost: "/media/generated/bento-cluster-cost.webp",
  bentoLogisticsPort: "/media/generated/bento-logistics-port.webp",
  bentoSkilledLabor: "/media/generated/bento-skilled-labor.webp",
  cityHardwareMachineryUnderlay: "/media/generated/city-hardware-machinery-underlay.webp",
  cityHomeApplianceFactoryUnderlay: "/media/generated/city-home-appliance-factory-underlay.webp",
  cityIndustrialClusterAerial: "/media/generated/city-industrial-cluster-aerial.webp",
  cityLightIndustryUnderlay: "/media/generated/city-light-industry-underlay.webp",
  cityNeutralIndustrialClusterCard: "/media/generated/city-neutral-industrial-cluster-card.webp",
  cityDenseExportIndustrialParkCard: "/media/generated/city-dense-export-industrial-park-card.webp",
  cityPortManufacturingUnderlay: "/media/generated/city-port-manufacturing-underlay.webp",
  cityTechParkUnderlay: "/media/generated/city-tech-park-underlay.webp",
  directoryCityHeatmap: "/media/generated/directory-city-heatmap.webp",
  directoryIndustryMatrix: "/media/generated/directory-industry-matrix.webp",
  industryAgriculturalMachinery: "/media/generated/industry-agricultural-machinery.webp",
  industryApparelGarmentFactory: "/media/generated/industry-apparel-garment-factory.webp",
  industryAutoPartsManufacturing: "/media/generated/industry-auto-parts-manufacturing.webp",
  industryBagsLuggageProduction: "/media/generated/industry-bags-luggage-production.webp",
  industryBuildingMaterials: "/media/generated/industry-building-materials.webp",
  industryCeramicsProduction: "/media/generated/industry-ceramics-production.webp",
  industryChemicalNewMaterials: "/media/generated/industry-chemical-new-materials.webp",
  industryCraftsWovenRattanIron: "/media/generated/industry-crafts-woven-rattan-iron.webp",
  industryFoodProcessing: "/media/generated/industry-food-processing.webp",
  industryFootwearProduction: "/media/generated/industry-footwear-production.webp",
  industryFurnitureInteriorProduction: "/media/generated/industry-furniture-interior-production.webp",
  industryGardenOutdoorSupplies: "/media/generated/industry-garden-outdoor-supplies.webp",
  industryGiftsPremiumsPackaging: "/media/generated/industry-gifts-premiums-packaging.webp",
  industryGlassCraftsProduction: "/media/generated/industry-glass-crafts-production.webp",
  industryHeavyConstructionMachinery: "/media/generated/industry-heavy-construction-machinery.webp",
  industryHouseholdGoodsProduction: "/media/generated/industry-household-goods-production.webp",
  industryKitchenTablewareProduction: "/media/generated/industry-kitchen-tableware-production.webp",
  industryLeatherDownProducts: "/media/generated/industry-leather-down-products.webp",
  industryLedLightingAssembly: "/media/generated/industry-led-lighting-assembly.webp",
  industryMedicalHealthDevices: "/media/generated/industry-medical-health-devices.webp",
  industryModularBuildingFacilities: "/media/generated/industry-modular-building-facilities.webp",
  industryMotorcycleBicycleAssembly: "/media/generated/industry-motorcycle-bicycle-assembly.webp",
  industryNewEnergySolarBattery: "/media/generated/industry-new-energy-solar-battery.webp",
  industryOfficeSchoolSupplies: "/media/generated/industry-office-school-supplies.webp",
  industryPersonalCareAppliances: "/media/generated/industry-personal-care-appliances.webp",
  industryPowerElectricalEquipment: "/media/generated/industry-power-electrical-equipment.webp",
  industrySanitaryBathroomFixtures: "/media/generated/industry-sanitary-bathroom-fixtures.webp",
  industrySportsLeisureProducts: "/media/generated/industry-sports-leisure-products.webp",
  industryToysBabyProducts: "/media/generated/industry-toys-baby-products.webp",
  industryWatchesGlassesPrecision: "/media/generated/industry-watches-glasses-precision.webp",
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

export function getIndustryVisualAsset(input: string) {
  const value = input.toLowerCase();

  if (/(medical|medicine|medicines|health|healthcare|device|devices|diagnostic|rehabilitation|laboratory|ppe|医疗|医药|保健|器械)/.test(value)) {
    return mediaAssets.industryMedicalHealthDevices;
  }

  if (/(auto|vehicle|vehicles|engine|brake|car |cars|汽车|车辆|汽配)/.test(value)) {
    return mediaAssets.industryAutoPartsManufacturing;
  }

  if (/(new energy vehicle|smart mobility|motorcycle|motorcycles|bicycle|bicycles|e-bike|bike|mobility|摩托|自行车|智慧出行|新能源汽车)/.test(value)) {
    return mediaAssets.industryMotorcycleBicycleAssembly;
  }

  if (/(new energy|solar|pv|battery|lithium|inverter|charging|新能源|光伏|电池)/.test(value)) {
    return mediaAssets.industryNewEnergySolarBattery;
  }

  if (/(building|decoration|decorative|construction material|ceramic tiling|tile|tiles|glass panel|aluminum profile|flooring|建筑|装饰材料|建材)/.test(value)) {
    return mediaAssets.industryBuildingMaterials;
  }

  if (/(integrated housing|courtyard|prefabricated|modular|装配式|庭院)/.test(value)) {
    return mediaAssets.industryModularBuildingFacilities;
  }

  if (/(furniture|interior|mattress|chair|wood|cabinet|家具|家居)/.test(value)) {
    return mediaAssets.industryFurnitureInteriorProduction;
  }

  if (/(lighting|led|downlight|streetlamp|照明)/.test(value)) {
    return mediaAssets.industryLedLightingAssembly;
  }

  if (/(food|packaged food|食品)/.test(value)) {
    return mediaAssets.industryFoodProcessing;
  }

  if (/(office|school|stationery|notebook|pen|binder|办公|学校|文具)/.test(value)) {
    return mediaAssets.industryOfficeSchoolSupplies;
  }

  if (/(toy|toys|baby|maternity|stroller|children product|孕婴|童|玩具)/.test(value)) {
    return mediaAssets.industryToysBabyProducts;
  }

  if (/(apparel|garment|clothing|sportswear|underwear|fashion|服装|男女装|童装|内衣|运动服)/.test(value)) {
    return mediaAssets.industryApparelGarmentFactory;
  }

  if (/(textile|fabric|fabrics|carpet|tapestr|纺织|面料|地毯|挂毯)/.test(value)) {
    return mediaAssets.cityLightIndustryUnderlay;
  }

  if (/(leather|down|fur|皮|羽绒|裘革)/.test(value)) {
    return mediaAssets.industryLeatherDownProducts;
  }

  if (/(shoe|shoes|footwear|鞋)/.test(value)) {
    return mediaAssets.industryFootwearProduction;
  }

  if (/(bag|bags|luggage|suitcase|箱包|手袋)/.test(value)) {
    return mediaAssets.industryBagsLuggageProduction;
  }

  if (/(kitchen|tableware|cookware|cutlery|餐厨|厨具|餐具)/.test(value)) {
    return mediaAssets.industryKitchenTablewareProduction;
  }

  if (/(household items|household|home utility|cleaning tool|家庭用品|日用品)/.test(value)) {
    return mediaAssets.industryHouseholdGoodsProduction;
  }

  if (/(bathroom|sanitary|faucet|shower|卫浴)/.test(value)) {
    return mediaAssets.industrySanitaryBathroomFixtures;
  }

  if (/(gift|premium|festive|festival|holiday|seasonal|礼品|赠品|节日)/.test(value)) {
    return mediaAssets.industryGiftsPremiumsPackaging;
  }

  if (/(garden|outdoor supplies|园林)/.test(value)) {
    return mediaAssets.industryGardenOutdoorSupplies;
  }

  if (/(sports|travel|leisure|fitness|体育|旅游|休闲)/.test(value)) {
    return mediaAssets.industrySportsLeisureProducts;
  }

  if (/(ceramic|ceramics|pottery|陶瓷)/.test(value)) {
    return mediaAssets.industryCeramicsProduction;
  }

  if (/(glass craft|glass crafts|玻璃工艺)/.test(value)) {
    return mediaAssets.industryGlassCraftsProduction;
  }

  if (/(chemical|new material|polymer|新材料|化工)/.test(value)) {
    return mediaAssets.industryChemicalNewMaterials;
  }

  if (/(power|electrical equipment|electrical product|electric cabinet|transformer|动力|电力|电子电气)/.test(value)) {
    return mediaAssets.industryPowerElectricalEquipment;
  }

  if (/(agricultural machinery|agriculture|tractor|irrigation|农业机械)/.test(value)) {
    return mediaAssets.industryAgriculturalMachinery;
  }

  if (/(woven|rattan|iron craft|crafts|craft|编织|藤铁|工艺品)/.test(value)) {
    return mediaAssets.industryCraftsWovenRattanIron;
  }

  if (/(clock|watch|watches|glasses|eyewear|钟表|眼镜)/.test(value)) {
    return mediaAssets.industryWatchesGlassesPrecision;
  }

  if (/(personal care|grooming|shaver|hair dryer|个人护理)/.test(value)) {
    return mediaAssets.industryPersonalCareAppliances;
  }

  if (/(construction machinery|engineering machinery|heavy machinery|工程机械)/.test(value)) {
    return mediaAssets.industryHeavyConstructionMachinery;
  }

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

export function getCityUnderlayAsset(input: string) {
  return getIndustryVisualAsset(input);
}
