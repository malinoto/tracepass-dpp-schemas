# Battery template ↔ CIRPASS-2 ontology alignment

Generated file. Do not edit by hand: it is rebuilt from the alignment the
TracePass passport checker uses, and a test fails when this copy falls behind.

Every field of the `battery` template (version 7, 142 fields) is
listed with its counterpart in the CIRPASS-2 EU DPP ontologies, or with "none"
where CIRPASS-2 has no term for it. A term is named only when it exists in the
ontology Turtle at the commits below and means the same datum. Field keys, labels and
provisions are those of [`templates/battery.json`](../templates/battery.json).

**What CIRPASS-2 is.** An EU-funded coordination action preparing the DPP
ecosystem. Its ontologies are a research draft: they state that they are not an
official ontology for the battery passport and do not represent the European
Commission or CEN/CENELEC JTC 24. The data model the EU DPP Registry validates
against is the Commission's own semantic package (core and batteries 1.0.0),
which is a separate artefact.

**Ontology source**

- [ontologies-battery](https://github.com/CIRPASS-2/ontologies-battery) at `c8e584748cb8` (2026-11-04)
- [ontologies-docs](https://github.com/CIRPASS-2/ontologies-docs) at `ff8a429f2327` (2026-11-04)

**Match types**

- **exact**: a CIRPASS-2 datatype property for the same datum.
- **structured**: CIRPASS-2 models the same datum as a node (a class, or an
  object property to a vocabulary or record). A converter builds the node.
- **none**: no CIRPASS-2 term. The note says why where the gap is deliberate.

**Summary**: 45 exact, 20 structured, 77 with no CIRPASS-2 term.

Prefixes: `bat:` https://w3id.org/eudpp/battery# · `bat-perf:` …/battery-performance# ·
`bat-label:` …/battery-labeling# · `bat-mat:` …/battery-materials# · `eudpp:`
https://w3id.org/eudpp#

| Field | Label | Provision | CIRPASS-2 term | Match | Note |
|---|---|---|---|---|---|
| `batteryUniqueIdentifier` | Battery Unique Identifier | Art. 77(3) | [`eudpp:hasUniqueProductIdentifier`](https://w3id.org/eudpp#hasUniqueProductIdentifier) | structured | Links the product to its unique product identifier node. |
| `batteryIdDmcCode` | Battery ID DMC Code | Art. 77(3) | — | none |  |
| `batteryPassportIdentifier` | Battery Passport Identifier | Art. 77(3) | [`eudpp:DPPIdentifier`](https://w3id.org/eudpp#DPPIdentifier) | structured | An identifier node, eudpp:DPPIdentifier. |
| `manufacturerName` | Manufacturer Name | Annex XIII 1(a) with Annex VI Part A(1) | [`eudpp:actorName`](https://w3id.org/eudpp#actorName) | exact | The name of the manufacturer actor. |
| `manufacturerTradeName` | Manufacturer Trade Name | Art. 38(7) | [`eudpp:registeredTradeName`](https://w3id.org/eudpp#registeredTradeName) | exact |  |
| `manufacturerPostalAddress` | Manufacturer Postal Address | Annex XIII 1(a) with Annex VI Part A(1) | — | none |  |
| `manufacturerEmail` | Manufacturer Email | Art. 38(7) | — | none |  |
| `manufacturerWebAddress` | Manufacturer Web Address | Art. 38(7) | — | none |  |
| `manufacturingDate` | Manufacturing Date | Annex XIII 1(a) with Annex VI Part A(4) | [`eudpp:manufacturingDate`](https://w3id.org/eudpp#manufacturingDate) | exact |  |
| `manufacturingPlace` | Manufacturing Place | Annex XIII 1(a) with Annex VI Part A(3) | — | none |  |
| `manufacturingCity` | Manufacturing Place — City | Annex XIII 1(a) with Annex VI Part A(3) | — | none |  |
| `manufacturingRegion` | Manufacturing Place — Region | Annex XIII 1(a) with Annex VI Part A(3) | — | none |  |
| `manufacturingCountry` | Manufacturing Place — Country | Annex XIII 1(a) with Annex VI Part A(3) | — | none |  |
| `batteryCategory` | Battery Category | Annex XIII 1(a) with Annex VI Part A(2) | — | none | Modelled as the battery-categories vocabulary (five legal categories), not as a property. The template splits industrial at 2 kWh, the Art. 77(1) passport threshold; mapping to the five is lossless in that direction only. |
| `batteryWeight` | Battery Weight | Annex XIII 1(a) with Annex VI Part A(5) | [`eudpp:Weight`](https://w3id.org/eudpp#Weight) | structured | A quantity node, eudpp:Weight. |
| `batteryStatus` | Battery Status | Annex XIII 4(c) | [`bat:hasBatteryStatus`](https://w3id.org/eudpp/battery#hasBatteryStatus) | structured | Points at the battery-statuses vocabulary, which spells one value "re-used"; the template's value is "reused". |
| `separateCollectionSymbol` | Separate Collection Symbol | Annex XIII 1(q), as corrected by 32023R1542R(13) | [`bat-label:separateCollectionSymbol`](https://w3id.org/eudpp/battery-labeling#separateCollectionSymbol) | exact |  |
| `cadmiumSymbol` | Cadmium Symbol | Annex XIII 1(q) | [`bat-label:cadmiumSymbol`](https://w3id.org/eudpp/battery-labeling#cadmiumSymbol) | exact |  |
| `leadSymbol` | Lead Symbol | Annex XIII 1(q) | [`bat-label:leadSymbol`](https://w3id.org/eudpp/battery-labeling#leadSymbol) | exact |  |
| `carbonFootprintLabel` | Carbon Footprint Label | Art. 7(2) | — | none |  |
| `meaningOfLabelsAndSymbols` | Meaning of Labels and Symbols | Annex XIII 1(s) with Art. 74(1)(e) | — | none |  |
| `euDeclarationOfConformity` | EU Declaration of Conformity | Annex XIII 1(r) | [`eudpp:hasEUDeclarationOfConformity`](https://w3id.org/eudpp#hasEUDeclarationOfConformity) | structured | Links the product to an eudpp:EUDeclarationOfConformity. |
| `testReportResults` | Results of Test Reports | Annex XIII 3 | [`bat:testReportResults`](https://w3id.org/eudpp/battery#testReportResults) | exact |  |
| `ceMarking` | CE Marking | Art. 20(1) | — | none |  |
| `carbonFootprintTotal` | Battery Carbon Footprint — Total | Annex XIII 1(c) | [`eudpp:CarbonFootprint`](https://w3id.org/eudpp#CarbonFootprint) | structured | An LCIA result node, eudpp:CarbonFootprint. |
| `cfRawMaterialAcquisition` | CF — Raw Material Acquisition & Pre-processing | Annex XIII 1(c) | — | none |  |
| `cfMainProductProduction` | CF — Main Product Production | Annex XIII 1(c) | — | none |  |
| `cfDistribution` | CF — Distribution | Annex XIII 1(c) | — | none |  |
| `cfEndOfLifeRecycling` | CF — End of Life & Recycling | Annex XIII 1(c) | — | none |  |
| `carbonFootprintPerformanceClass` | Carbon Footprint Performance Class | Annex XIII 1(c) | — | none |  |
| `carbonFootprintStudyUrl` | Carbon Footprint Study URL | Art. 7(1)(g) | — | none |  |
| `supplyChainDueDiligenceReport` | Supply Chain Due Diligence Report | Annex XIII 1(d) | [`bat:dueDiligenceReport`](https://w3id.org/eudpp/battery#dueDiligenceReport) | exact |  |
| `dueDiligencePolicy` | Due Diligence Policy | Art. 48(1) | — | none |  |
| `thirdPartyAuditResults` | Third-Party Audit Results | Art. 52(1) | — | none |  |
| `batteryChemistry` | Battery Chemistry | Annex XIII 1(a) with Annex VI Part A(7) | [`bat-mat:hasBatteryChemistry`](https://w3id.org/eudpp/battery-materials#hasBatteryChemistry) | structured | Points at the battery-chemistries vocabulary. |
| `cathodeActiveMaterials` | Cathode Active Materials | Annex XIII 2(a) | [`eudpp:MaterialOfComposition`](https://w3id.org/eudpp#MaterialOfComposition) | structured | Each entry is an eudpp:MaterialOfComposition, placed with battery-materials:hasBatteryLocation. |
| `anodeActiveMaterials` | Anode Active Materials | Annex XIII 2(a) | [`eudpp:MaterialOfComposition`](https://w3id.org/eudpp#MaterialOfComposition) | structured | Each entry is an eudpp:MaterialOfComposition, placed with battery-materials:hasBatteryLocation. |
| `electrolyteComposition` | Electrolyte Composition | Annex XIII 2(a) | [`eudpp:MaterialOfComposition`](https://w3id.org/eudpp#MaterialOfComposition) | structured | Each entry is an eudpp:MaterialOfComposition, placed with battery-materials:hasBatteryLocation. |
| `criticalRawMaterials` | Critical Raw Materials | Annex XIII 1(a) with Annex VI Part A(10) | [`eudpp:isCriticalRawMaterial`](https://w3id.org/eudpp#isCriticalRawMaterial) | structured | A flag on each material of composition, rather than a list. |
| `hazardousSubstances` | Hazardous Substances | Annex XIII 1(a) with Annex VI Part A(8) | — | none |  |
| `scipNotificationNumber` | SCIP Notification Number | Art. 77 | — | none |  |
| `recycledContentCobalt` | Recycled Content — Cobalt | Annex XIII 1(e) | [`eudpp:materialRecycledContent`](https://w3id.org/eudpp#materialRecycledContent) | structured | The recycled share on the cobalt material node. |
| `recycledContentLithium` | Recycled Content — Lithium | Annex XIII 1(e) | [`eudpp:materialRecycledContent`](https://w3id.org/eudpp#materialRecycledContent) | structured | The recycled share on the lithium material node. |
| `recycledContentNickel` | Recycled Content — Nickel | Annex XIII 1(e) | [`eudpp:materialRecycledContent`](https://w3id.org/eudpp#materialRecycledContent) | structured | The recycled share on the nickel material node. |
| `recycledContentLead` | Recycled Content — Lead | Annex XIII 1(e) | [`eudpp:materialRecycledContent`](https://w3id.org/eudpp#materialRecycledContent) | structured | The recycled share on the lead material node. |
| `roleOfEndUsersInWastePrevention` | Role of End-Users in Waste Prevention | Annex XIII 1(s) with Art. 74(1)(a) | — | none |  |
| `informationOnSeparateCollection` | Information on Separate Collection | Annex XIII 1(s) with Art. 74(1)(b) | — | none |  |
| `informationOnCollectionAndEndOfLifeTreatment` | Collection and End-of-Life Treatment Information | Annex XIII 1(s) with Art. 74(1)(c) | — | none |  |
| `safetyInstructionsWasteBatteries` | Safety Instructions for Waste Batteries | Annex XIII 1(s) with Art. 74(1)(d) | — | none |  |
| `impactOfHazardousSubstances` | Impact of Hazardous Substances | Annex XIII 1(s) with Art. 74(1)(f) | — | none |  |
| `dismantlingInformation` | Dismantling Information / Manual | Annex XIII 2(c) | [`bat:dismantlingInformation`](https://w3id.org/eudpp/battery#dismantlingInformation) | exact |  |
| `removalInformation` | Removal Information / Manual | Annex XIII 2(c) | — | none |  |
| `sparePartsInformation` | Spare Parts Information | Annex XIII 2(b) | — | none |  |
| `safetyInformationEndOfLife` | Safety Measures for Dismantling | Annex XIII 2(d) | [`bat:SafetyInstruction`](https://w3id.org/eudpp/battery#SafetyInstruction) | structured | A safety-instruction document node; bat:safetyMeasures is deprecated in its favour. |
| `safetyMeasures` | Safety Measures Document | Annex XIII 2(d) | [`bat:SafetyInstruction`](https://w3id.org/eudpp/battery#SafetyInstruction) | structured | A safety-instruction document node; bat:safetyMeasures is deprecated in its favour. |
| `recycledContentDocumentation` | Recycled Content Documentation | Annex XIII 1(e) | — | none |  |
| `batteryRemovabilityReplaceability` | Battery Removability & Replaceability | Art. 11(5) | — | none |  |
| `ratedCapacity` | Rated Capacity | Annex XIII 1(g) | [`bat-perf:ratedCapacity`](https://w3id.org/eudpp/battery-performance#ratedCapacity) | exact |  |
| `nominalVoltage` | Nominal Voltage | Annex XIII 1(h) | [`bat-perf:nominalVoltage`](https://w3id.org/eudpp/battery-performance#nominalVoltage) | exact |  |
| `nominalVoltageTemperatureRangeMin` | Nominal Voltage — Temperature Range Min | Annex XIII 1(h) | — | none |  |
| `nominalVoltageTemperatureRangeMax` | Nominal Voltage — Temperature Range Max | Annex XIII 1(h) | — | none |  |
| `minimumVoltage` | Minimum Voltage | Annex XIII 1(h) | [`bat-perf:minimumVoltage`](https://w3id.org/eudpp/battery-performance#minimumVoltage) | exact |  |
| `minimumVoltageTemperatureRangeMin` | Minimum Voltage — Temperature Range Min | Annex XIII 1(h) | — | none |  |
| `minimumVoltageTemperatureRangeMax` | Minimum Voltage — Temperature Range Max | Annex XIII 1(h) | — | none |  |
| `maximumVoltage` | Maximum Voltage | Annex XIII 1(h) | [`bat-perf:maximumVoltage`](https://w3id.org/eudpp/battery-performance#maximumVoltage) | exact |  |
| `maximumVoltageTemperatureRangeMin` | Maximum Voltage — Temperature Range Min | Annex XIII 1(h) | — | none |  |
| `maximumVoltageTemperatureRangeMax` | Maximum Voltage — Temperature Range Max | Annex XIII 1(h) | — | none |  |
| `originalPowerCapability` | Original Power Capability | Annex XIII 1(i) | [`bat-perf:originalPowerCapability`](https://w3id.org/eudpp/battery-performance#originalPowerCapability) | exact |  |
| `maximumAllowedBatteryPower` | Maximum Allowed Battery Power | Annex XIII 1(i) | [`bat-perf:maximumPermittedBatteryPower`](https://w3id.org/eudpp/battery-performance#maximumPermittedBatteryPower) | exact |  |
| `maximumAllowedBatteryPowerTemperatureRangeMin` | Maximum Allowed Battery Power — Temperature Range Min | Annex XIII 1(i) | — | none |  |
| `maximumAllowedBatteryPowerTemperatureRangeMax` | Maximum Allowed Battery Power — Temperature Range Max | Annex XIII 1(i) | — | none |  |
| `ratioMaxPowerMaxEnergy` | Ratio Nominal Power / Energy | Annex IV Part B(2) | [`bat-perf:powerToEnergyRatio`](https://w3id.org/eudpp/battery-performance#powerToEnergyRatio) | exact |  |
| `initialEnergyRoundTripEfficiency` | Initial Energy Round-Trip Efficiency | Annex XIII 1(n) | [`bat-perf:initialRoundTripEnergyEfficiency`](https://w3id.org/eudpp/battery-performance#initialRoundTripEnergyEfficiency) | exact |  |
| `initialInternalResistancePack` | Initial Internal Resistance — Pack | Annex XIII 1(o) | [`bat-perf:initialPackInternalResistance`](https://w3id.org/eudpp/battery-performance#initialPackInternalResistance) | exact |  |
| `initialInternalResistanceCell` | Initial Internal Resistance — Cell | Annex XIII 1(o) | [`bat-perf:initialCellInternalResistance`](https://w3id.org/eudpp/battery-performance#initialCellInternalResistance) | exact |  |
| `initialInternalResistanceModule` | Initial Internal Resistance — Module | Annex XIII 1(o) | — | none | CIRPASS-2 has cell and pack terms only; module resistance is not an Annex XIII datum. |
| `initialSelfDischargeRate` | Initial Self-Discharge Rate | Annex XIII 4(b) with Annex VII Part A(4) | [`bat-perf:initialSelfDischargeRate`](https://w3id.org/eudpp/battery-performance#initialSelfDischargeRate) | exact |  |
| `batteryEnergyTotal` | Battery Energy Total |  | — | none | No rated-energy term. battery-performance:certifiedUsableBatteryEnergy is the certified usable energy, a different datum. |
| `energyDensity` | Energy Density |  | — | none |  |
| `expectedLifetimeCycles` | Expected Lifetime — Cycles | Annex XIII 1(j) | [`bat-perf:expectedLifetimeCycles`](https://w3id.org/eudpp/battery-performance#expectedLifetimeCycles) | exact |  |
| `expectedLifetimeYears` | Expected Lifetime — Years | Annex XIII 4(a) | [`bat-perf:expectedLifetimeCalendarYears`](https://w3id.org/eudpp/battery-performance#expectedLifetimeCalendarYears) | exact |  |
| `expectedLifetimeReferenceConditions` | Expected Lifetime — Reference Conditions | Annex XIII 1(j) | — | none |  |
| `capacityThresholdForExhaustion` | Capacity Threshold for Exhaustion | Annex XIII 1(k) | [`bat-perf:capacityThresholdForExhaustion`](https://w3id.org/eudpp/battery-performance#capacityThresholdForExhaustion) | exact |  |
| `temperatureRangeIdleMin` | Temperature Range Idle — Min | Annex XIII 1(l) | [`bat-perf:temperatureRangeIdleStateLowerBoundary`](https://w3id.org/eudpp/battery-performance#temperatureRangeIdleStateLowerBoundary) | exact |  |
| `temperatureRangeIdleMax` | Temperature Range Idle — Max | Annex XIII 1(l) | [`bat-perf:temperatureRangeIdleStateUpperBoundary`](https://w3id.org/eudpp/battery-performance#temperatureRangeIdleStateUpperBoundary) | exact |  |
| `notInUseTemperatureRangeTest` | Temperature Range Idle — Reference Test | Annex XIII 1(l) | — | none |  |
| `cRateRelevantCycleLifeTest` | Charge C-Rate of Relevant Cycle-Life Test | Annex XIII 1(p) | [`bat-perf:chargeCRateOfCycleLifeTest`](https://w3id.org/eudpp/battery-performance#chargeCRateOfCycleLifeTest) | exact |  |
| `commercialWarrantyPeriod` | Commercial Warranty Period | Annex XIII 1(m) | [`bat:warrantyPeriod`](https://w3id.org/eudpp/battery#warrantyPeriod) | exact |  |
| `numberOfCells` | Number of Cells | Annex XIII 2(c) | — | none |  |
| `cellType` | Cell Type |  | — | none |  |
| `stateOfHealth` | State of Health — SoH | Annex XIII 4(b) | — | none |  |
| `stateOfCertifiedEnergy` | State of Certified Energy — SOCE | Annex XIII 4(b) | [`bat-perf:stateOfCertifiedEnergy`](https://w3id.org/eudpp/battery-performance#stateOfCertifiedEnergy) | exact |  |
| `remainingCapacity` | Remaining Capacity | Annex XIII 4(b) | [`bat-perf:remainingCapacity`](https://w3id.org/eudpp/battery-performance#remainingCapacity) | exact |  |
| `remainingPowerCapability` | Remaining Power Capability | Annex XIII 4(b) | [`bat-perf:remainingPowerCapability`](https://w3id.org/eudpp/battery-performance#remainingPowerCapability) | exact |  |
| `remainingEnergy` | Remaining Energy | Art. 77 | [`bat-perf:remainingUsableBatteryEnergy`](https://w3id.org/eudpp/battery-performance#remainingUsableBatteryEnergy) | exact |  |
| `currentInternalResistancePack` | Ohmic Resistance — Pack (State of Health) | Annex XIII 4(b) | — | none | No term for the current ohmic resistance; internalResistanceIncrease is the change, not the value. |
| `internalResistanceIncrease` | Internal Resistance Increase | Annex XIII 4(a) | [`bat-perf:internalResistanceIncrease`](https://w3id.org/eudpp/battery-performance#internalResistanceIncrease) | exact |  |
| `capacityFade` | Capacity Fade | Annex XIII 4(a) | [`bat-perf:capacityFade`](https://w3id.org/eudpp/battery-performance#capacityFade) | exact |  |
| `powerFade` | Power Fade | Annex XIII 4(a) | [`bat-perf:powerFade`](https://w3id.org/eudpp/battery-performance#powerFade) | exact |  |
| `roundTripEfficiencyFade` | Round-Trip Efficiency Fade | Annex XIII 4(a) | [`bat-perf:roundTripEnergyEfficiencyFade`](https://w3id.org/eudpp/battery-performance#roundTripEnergyEfficiencyFade) | exact |  |
| `evolutionOfSelfDischargeRate` | Evolution of Self-Discharge Rate | Annex XIII 4(b) | [`bat-perf:selfDischargeRateEvolution`](https://w3id.org/eudpp/battery-performance#selfDischargeRateEvolution) | exact |  |
| `selfDischargingRecordedTime` | Self-Discharge Rate — Date Measured | Annex XIII 4(b) | — | none |  |
| `numberOfFullEquivalentChargingCycles` | Number of Full Equivalent Charging Cycles | Annex XIII 4(d) | [`bat-perf:numberOfFullCycles`](https://w3id.org/eudpp/battery-performance#numberOfFullCycles) | exact |  |
| `capacityThroughput` | Capacity Throughput | Annex XIII 4(b) with Annex VII Part B(3) | [`bat-perf:capacityThroughput`](https://w3id.org/eudpp/battery-performance#capacityThroughput) | exact |  |
| `energyThroughput` | Energy Throughput | Annex XIII 4(b) with Annex VII Part B(2) | [`bat-perf:energyThroughput`](https://w3id.org/eudpp/battery-performance#energyThroughput) | exact |  |
| `numberOfChargingEvents` | Number of Charging Events | Annex XIII 4(d) | — | none |  |
| `dateOfServiceEntry` | Date of Service Entry | Annex XIII 4(b) with Annex VII Part B(1) | — | none |  |
| `negativeEvents` | Negative Events | Annex XIII 4(d) | — | none | CIRPASS-2 counts deep-discharge and overcharge events separately (numberOfDeepDischargeEvents, numberOfOverchargeEvents); the template keeps one list of events. |
| `currentStateOfCharge` | Current State of Charge — SoC | Annex XIII 4(d) | [`bat-perf:stateOfCharge`](https://w3id.org/eudpp/battery-performance#stateOfCharge) | exact |  |
| `temperatureConditionsHistorical` | Temperature Conditions Historical | Annex XIII 4(d) | — | none |  |
| `batteryModelIdentifier` | Battery Model Identifier | Annex XIII 1(a) with Annex VI Part A(2) | — | none |  |
| `economicOperatorIdentifier` | Economic Operator Identifier | Art. 77(4) and Art. 77(10) | [`eudpp:ActorIdentifier`](https://w3id.org/eudpp#ActorIdentifier) | structured | An identifier node, eudpp:ActorIdentifier. |
| `ceMarkingStatus` | CE Marking Status | Art. 20(1) | — | none |  |
| `extinguishingAgent` | Extinguishing Agent | Annex XIII 1(a) with Annex VI Part A(9) | [`bat-label:extinguishingAgent`](https://w3id.org/eudpp/battery-labeling#extinguishingAgent) | structured | Points at the battery-extinguisher-classes vocabulary; the template holds free text. |
| `renewableContentShare` | Share of Renewable Content | Annex XIII 1(f) | — | none |  |
| `roundTripEfficiencyAtHalfCycleLife` | Round-Trip Energy Efficiency at 50% of Cycle-Life | Annex XIII 1(n) | [`bat-perf:roundTripEnergyEfficiencyAt50PercentCycleLife`](https://w3id.org/eudpp/battery-performance#roundTripEnergyEfficiencyAt50PercentCycleLife) | exact |  |
| `componentPartNumbers` | Part Numbers for Components | Annex XIII 2(b) | [`bat:partNumber`](https://w3id.org/eudpp/battery#partNumber) | structured | One part number per component node. |
| `dynamicPowerCapability` | Power Capability (Dynamic, in W) | Annex XIII 4(a) | — | none |  |
| `dynamicEnergyRoundTripEfficiency` | Energy Round-Trip Efficiency (Dynamic, %) | Annex XIII 4(a) | — | none |  |
| `dynamicRatedCapacity` | Rated Capacity (Dynamic, in Ah) | Annex XIII 4(a) | — | none |  |
| `dynamicInternalResistance` | Internal Resistance (Dynamic, in Ω) | Annex XIII 4(a) | — | none |  |
| `dynamicExpectedLifetimeCycles` | Expected Lifetime (Dynamic, in cycles) | Annex XIII 4(a) | — | none |  |
| `remainingRoundTripEfficiency` | Remaining Round-Trip Efficiency | Annex XIII 4(b) | [`bat-perf:remainingRoundTripEnergyEfficiency`](https://w3id.org/eudpp/battery-performance#remainingRoundTripEnergyEfficiency) | exact |  |
| `preConsumerRecycledNickelShare` | Recycled Content — Nickel (battery manufacturing waste) | Art. 8(1) | — | none |  |
| `preConsumerRecycledCobaltShare` | Recycled Content — Cobalt (battery manufacturing waste) | Art. 8(1) | — | none |  |
| `preConsumerRecycledLithiumShare` | Recycled Content — Lithium (battery manufacturing waste) | Art. 8(1) | — | none |  |
| `postConsumerRecycledNickelShare` | Recycled Content — Nickel (post-consumer waste) | Art. 8(1) | — | none |  |
| `postConsumerRecycledCobaltShare` | Recycled Content — Cobalt (post-consumer waste) | Art. 8(1) | — | none |  |
| `postConsumerRecycledLithiumShare` | Recycled Content — Lithium (post-consumer waste) | Art. 8(1) | — | none |  |
| `originalPowerCapabilityAt80Soc` | Original Power Capability at 80% SoC | Annex IV Part B(4) | — | none |  |
| `originalPowerCapabilityAt20Soc` | Original Power Capability at 20% SoC | Annex IV Part B(4) | — | none |  |
| `temperatureInformation` | Temperature Information | Annex XIII 4(d) | [`bat-perf:temperatureInformation`](https://w3id.org/eudpp/battery-performance#temperatureInformation) | exact |  |
| `cadmiumLeadSymbolsUrl` | Cadmium and Lead Symbols URL | Annex XIII 1(q) as corrected by 32023R1542R(13) together with Art. 13(5) | — | none |  |
| `componentPartNumbersUrl` | Component Part Numbers URL | Annex XIII 2(b) | — | none |  |
| `sparePartsSourcesUrl` | Spare Parts Sources URL | Annex XIII 2(b) | — | none |  |
| `accidentsInformationUrl` | Accidents Information URL | Annex XIII 4(d) | [`bat-perf:accidentInformation`](https://w3id.org/eudpp/battery-performance#accidentInformation) | exact |  |
| `remainingPowerCapabilityAt80Soc` | Remaining Power Capability at 80% SoC | Annex XIII 4(b) | — | none |  |
| `remainingPowerCapabilityAt20Soc` | Remaining Power Capability at 20% SoC | Annex XIII 4(b) | — | none |  |
| `separateCollectionMarkingOnBattery` | Separate Collection Marking on Battery | Annex XIII 1(q), as corrected by 32023R1542R(13); Art. 13(4) | — | none |  |
| `separateCollectionMarkingOnPackaging` | Separate Collection Marking on Packaging | Annex XIII 1(q), as corrected by 32023R1542R(13); Art. 13(4) | — | none |  |
| `dischargeCRateRelevantCycleLifeTest` | Discharge C-Rate of Relevant Cycle-Life Test | Annex XIII 1(p) | [`bat-perf:dischargeCRateOfCycleLifeTest`](https://w3id.org/eudpp/battery-performance#dischargeCRateOfCycleLifeTest) | exact |  |
| `responsibleEconomicOperatorName` | Responsible Economic Operator Name | Art. 77(4) | — | none |  |
