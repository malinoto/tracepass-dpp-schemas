# Textile template ↔ CIRPASS-2 ontology alignment

Generated file. Do not edit by hand: it is rebuilt from the alignment the
TracePass passport checker uses, and a test fails when this copy falls behind.

Every field of the `textile` template (version 2, 60 fields) is
listed with its counterpart in the CIRPASS-2 EU DPP ontologies, or with "none"
where CIRPASS-2 has no term for it. A term is named only when it exists in the
ontology Turtle at the commits below and means the same datum. Field keys, labels and
provisions are those of [`templates/textile.json`](../templates/textile.json).

**What CIRPASS-2 is.** An EU-funded coordination action preparing the DPP
ecosystem. Its ontologies are a research draft and say they are not an official
artefact of the European Commission or CEN/CENELEC JTC 24. Its textile ontology models durability, recyclability and substances as assessments with methods and results, so most matches are structured. No delegated act sets textile passport content yet.

**Ontology source**

- [ontologie-textiles](https://github.com/CIRPASS-2/ontologie-textiles) at `40b08bff9316` (2026-11-03)
- [ontologies-docs](https://github.com/CIRPASS-2/ontologies-docs) at `ff8a429f2327` (2026-11-04)

**Match types**

- **exact**: a CIRPASS-2 datatype property for the same datum.
- **structured**: CIRPASS-2 models the same datum as a node (a class, or an
  object property to a vocabulary or record). A converter builds the node.
- **none**: no CIRPASS-2 term. The note says why where the gap is deliberate.

**Summary**: 4 exact, 21 structured, 35 with no CIRPASS-2 term.

Prefixes: `tx-core:` https://w3id.org/eudpp/textile-core# · `tx-dur:` …/textile-durability# · `tx-rec:` …/textile-recyclability# · `tx-proc:` …/textile-process# · `tx-ind:` …/textile-indicator# · `tx-rep:` …/textile-repairability# · `eudpp:` https://w3id.org/eudpp#

| Field | Label | Provision | CIRPASS-2 term | Match | Note |
|---|---|---|---|---|---|
| `productIdentifier` | Product Identifier (GTIN-14) | Art. 9(2) | [`eudpp:hasUniqueProductIdentifier`](https://w3id.org/eudpp#hasUniqueProductIdentifier) | structured | Links the product to its unique product identifier node. |
| `modelNumber` | Model Number | Art. 19(c) | — | none |  |
| `batchLotNumber` | Batch Number | Art. 27(5) | — | none |  |
| `serialNumber` | Serial Number | Art. 9(2) | — | none |  |
| `manufacturerName` | Manufacturer Name | Art. 19(a) | [`eudpp:actorName`](https://w3id.org/eudpp#actorName) | exact | The name of the manufacturer actor. |
| `manufacturerAddress` | Manufacturer Address | Art. 19(a) | — | none |  |
| `importerName` | Importer Name | Art. 29(3)(a); Annex III(j) | [`eudpp:actorName`](https://w3id.org/eudpp#actorName) | exact | The name of the importer actor. |
| `importerAddress` | Importer Address | Art. 29(3)(a); Annex III(j) | — | none |  |
| `euResponsiblePerson` | EU Responsible Person | Art. 9(2)(a) | — | none |  |
| `productName` | Product Name | Art. 19(c) | [`eudpp:productName`](https://w3id.org/eudpp#productName) | exact |  |
| `productCategory` | Product Category | Art. 9(2) | — | none |  |
| `productDescription` | Product Description | Art. 9(2) | [`eudpp:description`](https://w3id.org/eudpp#description) | exact |  |
| `fiberComposition` | Fiber Composition | Reg. (EU) 1007/2011 Arts. 9(1), 14(1), 16 — a durable, legible label physically attached to the product, in the language of the Member State | [`tx-core:hasFibreCompositionComponent`](https://w3id.org/eudpp/textile-core#hasFibreCompositionComponent) | structured | Each fibre is a textile-core:FibreCompositionComponent with its share. |
| `recycledContentPercentage` | Recycled Content Percentage | Art. 7(2)(b) | [`tx-rec:RecycledContent`](https://w3id.org/eudpp/textile-recyclability#RecycledContent) | structured | A recycled-content declaration node, with its source and share. |
| `careInstructions` | Care Instructions | Art. 7(2) | [`tx-proc:hasCareInstruction`](https://w3id.org/eudpp/textile-process#hasCareInstruction) | structured | Links the product to a textile care instruction node. |
| `substancesOfConcern` | Substances of Concern | REACH Art. 33(1)–(2) — to every recipient of the article, and to a consumer on request, above 0.1% w/w; minimum content the substance name | [`eudpp:containsSubstanceOfConcern`](https://w3id.org/eudpp#containsSubstanceOfConcern) | structured | Links the product to each substance of concern node. |
| `certifications` | Certifications | Art. 9(2) | — | none |  |
| `countryOfManufacture` | Country of Manufacture | Art. 9(2) | — | none | eudpp:countryOfOrigin is the customs country of origin, which can differ from where the product was made. |
| `carbonFootprint` | Carbon Footprint | Art. 7(2)(a) | [`eudpp:CarbonFootprint`](https://w3id.org/eudpp#CarbonFootprint) | structured | An LCIA result node, eudpp:CarbonFootprint. |
| `environmentalFootprintScore` | Environmental Footprint Score (PEF) | Art. 7(2)(a) | [`eudpp:EnvironmentalFootprintScore`](https://w3id.org/eudpp#EnvironmentalFootprintScore) | structured | An aggregated single-score indicator node. |
| `recyclabilityScore` | Recyclability Score | Art. 7(2)(b) | [`tx-rec:hasRecyclabilityScore`](https://w3id.org/eudpp/textile-recyclability#hasRecyclabilityScore) | structured | Links an assessment result to its method-specific score. |
| `recyclabilityLabel` | Recyclability Label | Art. 7(2)(b) | [`tx-rec:hasRecyclabilityLabel`](https://w3id.org/eudpp/textile-recyclability#hasRecyclabilityLabel) | structured | Links a score to its method-specific label concept. |
| `monoMaterialPercentage` | Mono-Material Percentage | Art. 7(2)(b) | — | none | eudpp:materialPercentage is one material's share, not the single-material share of the product. |
| `expectedLifespan` | Expected Lifespan | Art. 7(2)(c) | [`tx-ind:LifetimeOfProduct`](https://w3id.org/eudpp/textile-indicator#LifetimeOfProduct) | structured | A lifetime indicator node, with its descriptor and assumptions. |
| `durabilityPillingResistance` | Pilling Resistance | Art. 7(2)(c) | [`tx-dur:PillingResistance`](https://w3id.org/eudpp/textile-durability#PillingResistance) | structured | A durability performance parameter node, with its test method. |
| `durabilityAbrasionResistance` | Abrasion Resistance | Art. 7(2)(c) | [`tx-dur:AbrasionResistance`](https://w3id.org/eudpp/textile-durability#AbrasionResistance) | structured | A durability performance parameter node, with its test method. |
| `durabilityColorFastnessWashing` | Color Fastness to Washing | Art. 7(2)(c) | [`tx-dur:ColourFastness`](https://w3id.org/eudpp/textile-durability#ColourFastness) | structured | Colour fastness, with washing as the test condition. |
| `durabilityColorFastnessLight` | Color Fastness to Light | Art. 7(2)(c) | [`tx-dur:ColourFastness`](https://w3id.org/eudpp/textile-durability#ColourFastness) | structured | Colour fastness, with light as the test condition. |
| `durabilityDimensionalStability` | Dimensional Stability (Shrinkage) | Art. 7(2)(c) | [`tx-dur:DimensionalStability`](https://w3id.org/eudpp/textile-durability#DimensionalStability) | structured | A durability performance parameter node, with its test method. |
| `durabilityTearStrength` | Tear Strength | Art. 7(2)(c) | — | none | textile-durability:TearOrRip is a failure mode, not a strength measurement. |
| `repairInstructions` | Repair Instructions |  | [`tx-rep:hasRepairGuidance`](https://w3id.org/eudpp/textile-repairability#hasRepairGuidance) | structured | Links the product to repair guidance. |
| `sparePartsAvailability` | Spare Parts Availability |  | — | none |  |
| `disassemblyInstructions` | Disassembly Instructions |  | — | none |  |
| `recyclingInstructions` | Recycling Instructions |  | — | none |  |
| `collectionPointsUrl` | Collection Points URL |  | — | none |  |
| `takeBackProgram` | Take-Back Program |  | — | none |  |
| `microplasticsRelease` | Microplastics Release | Art. 7(2)(a) | [`eudpp:MicroplasticRelease`](https://w3id.org/eudpp#MicroplasticRelease) | structured | A microplastic-release parameter node (ESPR Annex I(p)). |
| `microplasticsSheddingRate` | Microplastics Shedding Rate | Art. 7(2)(a) | [`eudpp:MicroplasticRelease`](https://w3id.org/eudpp#MicroplasticRelease) | structured | The quantified release on the same microplastic-release node. |
| `supplyChainTraceability` | Supply Chain Traceability |  | — | none |  |
| `weavingCountry` | Weaving Country |  | — | none |  |
| `dyeingCountry` | Dyeing Country |  | — | none |  |
| `assemblyCountry` | Assembly Country |  | — | none |  |
| `dyeingMethod` | Dyeing Method |  | — | none |  |
| `finishingProcesses` | Finishing Processes |  | [`tx-proc:FinishingProcess`](https://w3id.org/eudpp/textile-process#FinishingProcess) | structured | Each finishing step is a textile process node. |
| `waterConsumptionLiters` | Water Consumption | Art. 7(2)(a) | [`eudpp:WaterConsumptionResult`](https://w3id.org/eudpp#WaterConsumptionResult) | structured | An LCA inventory result node. |
| `energyConsumptionKwh` | Energy Consumption | Art. 7(2)(a) | [`eudpp:EnergyConsumptionResult`](https://w3id.org/eudpp#EnergyConsumptionResult) | structured | An LCA inventory result node. |
| `transportDistanceKm` | Transport Distance |  | — | none |  |
| `transportMode` | Transport Mode |  | — | none |  |
| `laborConditionsCertification` | Labor Conditions Certification |  | — | none |  |
| `animalWelfareStatus` | Animal Welfare Status |  | — | none |  |
| `packagingRecycledContentPct` | Packaging Recycled Content | Art. 7(2)(b) | — | none |  |
| `packagingRecyclability` | Packaging Recyclability | Art. 7(2)(b) | — | none |  |
| `ecoScoreValue` | Eco-Score Value |  | — | none |  |
| `ecoScoreGrade` | Eco-Score Grade |  | — | none |  |
| `pefClimateChange` | PEF Climate Change Impact |  | — | none |  |
| `pefWaterUse` | PEF Water Use |  | — | none |  |
| `pefEutrophication` | PEF Eutrophication |  | — | none |  |
| `pefResourceDepletion` | PEF Resource Depletion |  | — | none |  |
| `durabilityBonusMalus` | Durability Bonus/Malus |  | — | none |  |
| `microfiberReleaseCoefficient` | Microfiber Release Coefficient |  | — | none |  |
