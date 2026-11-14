# Tyres template ↔ CIRPASS-2 ontology alignment

Generated file. Do not edit by hand: it is rebuilt from the alignment the
TracePass passport checker uses, and a test fails when this copy falls behind.

Every field of the `tyres` template (version 2, 93 fields) is
listed with its counterpart in the CIRPASS-2 EU DPP ontologies, or with "none"
where CIRPASS-2 has no term for it. A term is named only when it exists in the
ontology Turtle at the commits below and means the same datum. Field keys, labels and
provisions are those of [`templates/tyres.json`](../templates/tyres.json).

**What CIRPASS-2 is.** An EU-funded coordination action preparing the DPP
ecosystem. Its ontologies are a research draft and say they are not an official
artefact of the European Commission or CEN/CENELEC JTC 24. Its tyre ontology calls itself an example ontology (ETO), built from the CIRPASS-2 tyre pilot, and models most tyre attributes as classes, so most matches are structured. No delegated act sets tyre passport content yet.

**Ontology source**

- [ontologies-tyre](https://github.com/CIRPASS-2/ontologies-tyre) at `bc9d172c678a` (2026-11-03)
- [ontologies-docs](https://github.com/CIRPASS-2/ontologies-docs) at `ff8a429f2327` (2026-11-04)

**Match types**

- **exact**: a CIRPASS-2 datatype property for the same datum.
- **structured**: CIRPASS-2 models the same datum as a node (a class, or an
  object property to a vocabulary or record). A converter builds the node.
- **none**: no CIRPASS-2 term. The note says why where the gap is deliberate.

**Summary**: 6 exact, 24 structured, 63 with no CIRPASS-2 term.

Prefixes: `eto:` https://w3id.org/eudpp/eto# · `eudpp:` https://w3id.org/eudpp#

| Field | Label | Provision | CIRPASS-2 term | Match | Note |
|---|---|---|---|---|---|
| `uniqueProductIdentifier` | Unique Product Identifier | Art. 9(2) | [`eudpp:hasUniqueProductIdentifier`](https://w3id.org/eudpp#hasUniqueProductIdentifier) | structured | Links the product to its unique product identifier node. |
| `uniqueOperatorIdentifier` | Unique Operator Identifier | Art. 9(2) | [`eudpp:hasUniqueOperatorIdentifier`](https://w3id.org/eudpp#hasUniqueOperatorIdentifier) | structured | Links the operator to its unique operator identifier node. |
| `uniqueFacilityIdentifier` | Unique Facility Identifier | Art. 9(2) | [`eudpp:hasUniqueFacilityIdentifier`](https://w3id.org/eudpp#hasUniqueFacilityIdentifier) | structured | Links the facility to its unique facility identifier node. |
| `supplierName` | Supplier Name | Annex III(a) | [`eudpp:actorName`](https://w3id.org/eudpp#actorName) | exact | The name of the supplier actor. |
| `supplierAddress` | Supplier Address | Art. 9(2) | — | none |  |
| `importerName` | Importer Name | Art. 9(2) | [`eudpp:actorName`](https://w3id.org/eudpp#actorName) | exact | The name of the importer actor. |
| `importerEoriNumber` | Importer EORI Number | Art. 9(2) | — | none |  |
| `commercialName` | Commercial Name | No element of Annex II, III or VII: the label and product information sheet carry the supplier's trade name (Annex III(a)) and the tyre type identifier, not a commercial name | [`eudpp:productName`](https://w3id.org/eudpp#productName) | exact |  |
| `tyreTypeIdentifier` | Tyre Type Identifier | Annex III(b)–(c) (product information sheet) + Art. 5(1) and Annex VII (EPREL entry); shown on the label under Art. 4(1) | — | none |  |
| `tyreClass` | Tyre Class | Annex II point 2 (tyre class shown on the label); classes defined in Art. 3 | — | none | No term for the C1/C2/C3 tyre class. |
| `batchLotNumber` | Batch or Serial Number |  | — | none |  |
| `dateOfManufactureWeekYear` | Date of Manufacture (Week/Year) | Art. 5(3) + Annex II (UN Regulation No 30 para 3.1.9 / No 54): week and year of manufacture moulded on the sidewall | [`eudpp:manufacturingDate`](https://w3id.org/eudpp#manufacturingDate) | exact | Its range is left open for sectors; tyres use the DOT week and year. |
| `dateStartOfProduction` | Date Start of Production | Annex III(i) (product information sheet) + Art. 5(1) and Annex VII (EPREL entry) | [`eto:productionStartWeek`](https://w3id.org/eudpp/eto#productionStartWeek) | exact |  |
| `dateEndOfProduction` | Date End of Production | Annex III(j) (product information sheet) + Art. 5(1) and Annex VII (EPREL entry) | [`eto:productionEndWeek`](https://w3id.org/eudpp/eto#productionEndWeek) | exact |  |
| `countryOfManufacture` | Country of Manufacture | Art. 9(2) | — | none |  |
| `eprelRegistrationNumber` | EPREL Registration Number | Art. 5(1) + Annex VII: the supplier registers the tyre type in EPREL; no provision requires the registration number or link to be shown | — | none |  |
| `eprelProductUrl` | EPREL Product URL | Art. 5(1) + Annex VII: the supplier registers the tyre type in EPREL; no provision requires the registration number or link to be shown | [`eto:EPRELRecordReferenceUrl`](https://w3id.org/eudpp/eto#EPRELRecordReferenceUrl) | structured | The CIRPASS-2 tyre ontology is an example ontology from the tyre pilot and models each attribute as a class. |
| `dataCarrierType` | Data Carrier Type | Art. 9(2) | — | none |  |
| `passportIssuer` | Passport Issuer | Art. 9(2) | — | none |  |
| `tyreSizeDesignation` | Tyre Size Designation | Annex III(b)–(c) (product information sheet) + Art. 5(1) and Annex VII (EPREL entry); shown on the label under Art. 4(1) | [`eto:GeometricalTyreSize`](https://w3id.org/eudpp/eto#GeometricalTyreSize) | structured | The CIRPASS-2 tyre ontology is an example ontology from the tyre pilot and models each attribute as a class. |
| `loadCapacityIndex` | Load Capacity Index | Annex III(b)–(c) (product information sheet) + Art. 5(1) and Annex VII (EPREL entry); shown on the label under Art. 4(1) | [`eto:LoadIndex`](https://w3id.org/eudpp/eto#LoadIndex) | structured | The CIRPASS-2 tyre ontology is an example ontology from the tyre pilot and models each attribute as a class. |
| `loadVersion` | Load Version | Art. 5(3) + Annex II (UN Regulation No 30 para 3.1.8): sidewall marking | [`eto:LoadVersion`](https://w3id.org/eudpp/eto#LoadVersion) | structured | The CIRPASS-2 tyre ontology is an example ontology from the tyre pilot and models each attribute as a class. |
| `speedCategorySymbol` | Speed Category Symbol | Annex III(b)–(c) (product information sheet) + Art. 5(1) and Annex VII (EPREL entry); shown on the label under Art. 4(1) | [`eto:SpeedSymbol`](https://w3id.org/eudpp/eto#SpeedSymbol) | structured | The CIRPASS-2 tyre ontology is an example ontology from the tyre pilot and models each attribute as a class. |
| `speedRatingKmh` | Speed Rating (km/h) |  | — | none |  |
| `tyreConstruction` | Tyre Construction | Art. 5(3) + Annex II (UN Regulation No 30 para 3.1.3; No 54 for C2/C3) | [`eto:Structure`](https://w3id.org/eudpp/eto#Structure) | structured | The CIRPASS-2 tyre ontology is an example ontology from the tyre pilot and models each attribute as a class. Radial, diagonal or bias-belted. |
| `tyreType` | Tyre Type |  | — | none |  |
| `sectionWidthMm` | Section Width (mm) |  | [`eto:SectionWidth`](https://w3id.org/eudpp/eto#SectionWidth) | structured | The CIRPASS-2 tyre ontology is an example ontology from the tyre pilot and models each attribute as a class. |
| `aspectRatio` | Aspect Ratio |  | [`eto:AspectRatio`](https://w3id.org/eudpp/eto#AspectRatio) | structured | The CIRPASS-2 tyre ontology is an example ontology from the tyre pilot and models each attribute as a class. |
| `rimDiameterInches` | Rim Diameter (inches) |  | [`eto:RimCode`](https://w3id.org/eudpp/eto#RimCode) | structured | The CIRPASS-2 tyre ontology is an example ontology from the tyre pilot and models each attribute as a class. The rim code is the nominal rim diameter in inches. |
| `treadDepthMm` | Tread Depth (mm) |  | — | none | The example tyre ontology has the in-use remaining tread depth, not the new-tyre depth. |
| `tyreWeightKg` | Tyre Weight (kg) |  | [`eudpp:Weight`](https://w3id.org/eudpp#Weight) | structured | A quantity node, eudpp:Weight. |
| `fuelEfficiencyClass` | Fuel Efficiency Class | Reg. (EU) 2020/740 Art. 4 + Annex I Part A — class shown on the tyre label and registered in EPREL | [`eto:RollingResistanceClass`](https://w3id.org/eudpp/eto#RollingResistanceClass) | structured | The CIRPASS-2 tyre ontology is an example ontology from the tyre pilot and models each attribute as a class. The label's fuel-efficiency class is the rolling-resistance class. |
| `rollingResistanceCoefficientNKn` | Rolling Resistance Coefficient (N/kN) | Art. 4(5) (values used to determine the class, given to the national authority) + Annex VII point 2(e) (EPREL compliance part); not in the label or product information sheet | — | none |  |
| `wetGripClass` | Wet Grip Class | Reg. (EU) 2020/740 Art. 4 + Annex I Part B — class shown on the tyre label and registered in EPREL | [`eto:WetClass`](https://w3id.org/eudpp/eto#WetClass) | structured | The CIRPASS-2 tyre ontology is an example ontology from the tyre pilot and models each attribute as a class. |
| `wetGripIndex` | Wet Grip Index | Art. 4(5) (values used to determine the class, given to the national authority) + Annex VII point 2(e) (EPREL compliance part); not in the label or product information sheet | — | none |  |
| `externalRollingNoiseClass` | External Rolling Noise Class | Reg. (EU) 2020/740 Art. 4 + Annex I Part C — class shown on the tyre label and registered in EPREL | [`eto:NoiseClass`](https://w3id.org/eudpp/eto#NoiseClass) | structured | The CIRPASS-2 tyre ontology is an example ontology from the tyre pilot and models each attribute as a class. |
| `externalRollingNoiseDb` | External Rolling Noise (dB) | Reg. (EU) 2020/740 Annex I Part C — measured dB value on the label and in EPREL | [`eto:NoisePerformance`](https://w3id.org/eudpp/eto#NoisePerformance) | structured | The CIRPASS-2 tyre ontology is an example ontology from the tyre pilot and models each attribute as a class. |
| `snowGrip` | Snow Grip | Art. 4 + Annex I (3PMSF snow-grip pictogram where applicable) | [`eto:SevereSnowMarking`](https://w3id.org/eudpp/eto#SevereSnowMarking) | structured | The CIRPASS-2 tyre ontology is an example ontology from the tyre pilot and models each attribute as a class. The 3PMSF severe-snow marking. |
| `iceGrip` | Ice Grip | Art. 4 + Annex I Part E (ice-grip pictogram for a C1 tyre meeting the minimum ice grip index) | [`eto:IceGripMarking`](https://w3id.org/eudpp/eto#IceGripMarking) | structured | The CIRPASS-2 tyre ontology is an example ontology from the tyre pilot and models each attribute as a class. |
| `tyreAbrasionRateMgKm` | Tyre Abrasion Rate (mg/km) |  | — | none |  |
| `abrasionIndex` | Abrasion Index |  | — | none |  |
| `abrasionTestMethod` | Abrasion Test Method |  | — | none |  |
| `testDistanceKm` | Test Distance (km) |  | — | none |  |
| `microplasticsEmissionClass` | Microplastics Emission Class |  | — | none |  |
| `mileageWarrantyKm` | Mileage Warranty (km) |  | — | none |  |
| `billOfMaterials` | Bill of Materials | Art. 7(2)(b)(i) + Annex I | [`eudpp:MaterialOfComposition`](https://w3id.org/eudpp#MaterialOfComposition) | structured | Each entry is an eudpp:MaterialOfComposition. |
| `naturalRubberContentPercentage` | Natural Rubber Content (%) | Art. 7(2)(b)(i) + Annex I | — | none |  |
| `syntheticRubberContentPercentage` | Synthetic Rubber Content (%) | Art. 7(2)(b)(i) + Annex I | — | none |  |
| `recycledContentPercentage` | Recycled Content (%) | Art. 7(2)(b)(i) + Annex I | — | none |  |
| `recycledRubberContentPercentage` | Recycled Rubber Content (%) | Art. 7(2)(b)(i) + Annex I | — | none |  |
| `recycledCarbonBlackPercentage` | Recycled Carbon Black (%) | Art. 7(2)(b)(i) + Annex I | — | none |  |
| `renewableMaterialContentPercentage` | Renewable Material Content (%) | Art. 7(2)(b)(i) + Annex I | — | none |  |
| `pahContentCompliant` | PAH Content Compliant | REACH Annex XVII entry 50 — restriction on PAH content in extender oils and tyres | — | none |  |
| `svhcCandidateListSubstances` | SVHC Candidate List Substances | Art. 33(1)–(2) | [`eudpp:containsSubstanceOfConcern`](https://w3id.org/eudpp#containsSubstanceOfConcern) | structured | Links the product to each substance of concern node. |
| `sixPpdContent` | 6PPD Content |  | — | none |  |
| `heavyMetalsCompliance` | Heavy Metals Compliance | REACH Annex XVII — market-placement restriction; evidence retained by the manufacturer | — | none |  |
| `reachCompliance` | REACH Compliance | REACH (EC) 1907/2006 — registration and restriction obligations evidenced in the manufacturer's records | — | none |  |
| `carbonFootprint` | Carbon Footprint (kg CO2e) | Art. 7(2)(b)(i) + Annex I | [`eudpp:CarbonFootprint`](https://w3id.org/eudpp#CarbonFootprint) | structured | An LCIA result node, eudpp:CarbonFootprint. |
| `carbonFootprintMethodology` | Carbon Footprint Methodology |  | — | none |  |
| `fuelSavingsOverLifetimeLiters` | Fuel Savings Over Lifetime (liters) |  | — | none |  |
| `co2SavingsOverLifetimeKg` | CO2 Savings Over Lifetime (kg) |  | — | none |  |
| `naturalRubberDeforestationFree` | Natural Rubber Deforestation-Free | EUDR (EU) 2023/1115 Art. 4 — due diligence statement lodged in the EU Information System by the operator | — | none |  |
| `naturalRubberSustainabilityCertification` | Natural Rubber Sustainability Certification |  | — | none |  |
| `expectedMileageKm` | Expected Mileage (km) | Art. 7(2)(b)(i) + Annex I | — | none |  |
| `treadwearRating` | Treadwear Rating |  | — | none |  |
| `minimumTreadDepthMm` | Minimum Tread Depth (mm) | Dir. 2014/45/EU Annex I — roadworthiness test requirement on the vehicle in use | — | none |  |
| `warrantyPeriodYears` | Warranty Period (years) | Art. 7(2)(b)(i) + Annex I | — | none |  |
| `maxAgeRecommendationYears` | Max Age Recommendation (years) |  | — | none |  |
| `retreadable` | Retreadable | Art. 7(2)(b)(i) + Annex I | — | none |  |
| `maximumRetreadCycles` | Maximum Retread Cycles |  | — | none | eto:RetreadingCycle describes a retreading that took place, not the casing's maximum. |
| `retreadServiceLifeExtensionKm` | Retread Service Life Extension (km) |  | — | none |  |
| `recyclabilityPercentage` | Recyclability (%) | Art. 7(2)(b)(i) + Annex I | — | none |  |
| `recyclabilityBreakdown` | Recyclability Breakdown | Art. 7(2)(b)(i) + Annex I | — | none |  |
| `eltCollectionScheme` | ELT Collection Scheme | WFD Dir. 2008/98/EC Art. 8a — extended producer responsibility discharged through national EPR scheme registration | — | none |  |
| `disassemblyInstructionsUrl` | Disassembly Instructions URL | Art. 7(2)(b)(iii) | — | none |  |
| `pyrolysisSuitability` | Pyrolysis Suitability |  | — | none |  |
| `devulcanizationSuitability` | Devulcanization Suitability |  | — | none |  |
| `typeApprovalNumber` | Type Approval Number | Art. 5(3) + Annex II (UN Regulation No 30 para 5.4; No 54 for C2/C3) | — | none |  |
| `euro7Compliance` | Euro 7 Compliance | Reg. (EU) 2024/1257 — tyre abrasion limits not yet in force | — | none |  |
| `euTyreLabelImageUrl` | EU Tyre Label Image URL | Reg. (EU) 2020/740 Arts. 4 and 6 — label displayed in visual form at the point of sale | [`eto:LabelPictureUrl`](https://w3id.org/eudpp/eto#LabelPictureUrl) | structured | The CIRPASS-2 tyre ontology is an example ontology from the tyre pilot and models each attribute as a class. |
| `declarationOfConformityUrl` | Declaration of Conformity URL | Conformity is shown by the UN Regulation No 30/54 approval mark (No 30 para 5.4) under GSR Art. 5(3) + Annex II; tyres have no EU declaration of conformity, and GPSR Art. 9 does not apply to them (GPSR Art. 2(1), third subparagraph, point (b)) | [`eudpp:hasEUDeclarationOfConformity`](https://w3id.org/eudpp#hasEUDeclarationOfConformity) | structured | Links the product to an eudpp:EUDeclarationOfConformity. |
| `otherCertifications` | Other Certifications |  | — | none |  |
| `recommendedInflationPressureKpa` | Recommended Inflation Pressure (kPa) |  | — | none |  |
| `maximumInflationPressureKpa` | Maximum Inflation Pressure (kPa) |  | — | none |  |
| `maximumLoadKg` | Maximum Load (kg) |  | — | none |  |
| `tyrePressureMonitoringCompatible` | TPMS Compatible | Art. 5(1)–(2): tyre-pressure monitoring is a vehicle requirement | — | none |  |
| `runFlatCapability` | Run-Flat Capability | Art. 5(3) + Annex II (UN Regulation No 30 para 3.1.3 and 3.1.12; No 54 for C2/C3) | — | none |  |
| `safetyWarnings` | Safety Warnings | No passport duty. GPSR Art. 9(7) does not apply to tyres (GPSR Art. 2(1), third subparagraph, point (b)); the nearest tyre-specific information duty is 2020/740 Annex IV (technical promotional material) | — | none |  |
| `storageInstructions` | Storage Instructions |  | — | none |  |
| `dppSchemaVersion` | DPP Schema Version |  | — | none |  |
| `lastUpdatedAt` | Last Updated At | Art. 10 | — | none |  |
| `accessLevel` | Access Rights | Art. 10(3) | — | none |  |
| `dataFormat` | Data Format | Art. 9-10 | — | none |  |
