export type SeedPassage = { heading: string; page: number; text: string };

export type SeedReport = {
  publicId: string;
  expeditionSlug: string;
  title: string;
  description: string;
  author: string;
  licence: string;
  tags: string[];
  year: number;
  pageCount: number;
  sizeBytes: number;
  passages: SeedPassage[];
};

export const REPORTS_A: SeedReport[] = [
  {
    publicId: "iae-43-ice-sheet-mass-balance",
    expeditionSlug: "iae-43",
    title: "Ice-Sheet Mass Balance Along the Ingrid Christensen Coast, IAE-43",
    description:
      "Final campaign report on surface elevation change, phase-sensitive radar returns and surface mass balance along 240 km of the Ingrid Christensen Coast.",
    author: "Dr. Ananya Rao et al.",
    licence: "CC-BY-4.0",
    tags: ["glaciology", "mass balance", "remote sensing"],
    year: 2025,
    pageCount: 118,
    sizeBytes: 14_820_000,
    passages: [
      {
        heading: "Key finding",
        page: 12,
        text: "Between December 2024 and March 2025 the grounding zone of the Ingrid Christensen Coast thinned at a mean rate of 1.9 metres per year, roughly double the 2015–2019 average of 0.95 metres per year. Thinning is not uniform: ninety-one per cent of the measured loss is concentrated in six outlet glaciers that drain into the Prydz Bay embayment, while the interior accumulation zone above 1 400 metres gained mass at 0.31 metres per year.",
      },
      {
        heading: "Methods",
        page: 34,
        text: "We deployed eleven autonomous phase-sensitive radio-echo sounders at 15 km spacing, each recording ice thickness every four seconds with a vertical precision of 7 millimetres. These in situ returns were co-registered with ICESat-2 ATL06 elevations and Sentinel-1 synthetic aperture radar velocity fields to separate dynamic thinning from surface processes.",
      },
      {
        heading: "Implications for sea level",
        page: 87,
        text: "Extrapolated across the surveyed sector, the measured thinning contributes 0.07 millimetres per year to global mean sea level, an increase of 0.04 millimetres per year over the previous inter-survey period. The acceleration is driven by oceanic melt at the grounding line rather than atmospheric warming, which the surface energy balance shows was statistically unchanged over the decade.",
      },
      {
        heading: "Recommendation",
        page: 104,
        text: "We recommend that the phase-sensitive radar array be maintained through at least two more annual cycles before any statement on multi-decadal trend is made public, and that the six hotspot outlet glaciers be designated priority basins for the forthcoming Indian satellite altimetry mission.",
      },
    ],
  },
  {
    publicId: "iae-43-emperor-penguin-census",
    expeditionSlug: "iae-43",
    title: "Emperor Penguin Colony Census by Drone Photogrammetry, IAE-43",
    description:
      "First Indian drone-based census of four emperor penguin colonies near the Svenner Islands, with methodological notes on minimal-disturbance flight planning.",
    author: "Dr. Kavya Menon et al.",
    licence: "CC-BY-4.0",
    tags: ["biodiversity", "penguin", "census", "remote sensing"],
    year: 2025,
    pageCount: 64,
    sizeBytes: 9_140_000,
    passages: [
      {
        heading: "Colony counts",
        page: 9,
        text: "Four emperor penguin colonies near the Svenner Islands were counted from orthomosaics flown at 80 metres altitude. The largest colony held an estimated 8 340 breeding pairs, the smallest 1 120. Across all four colonies the 2024–25 breeding season showed a 12 per cent decline against the 2019 baseline, with the steepest loss at the northernmost site, which experienced early fast-ice breakout in late October.",
      },
      {
        heading: "Fast ice as habitat",
        page: 31,
        text: "Fast-ice breakout date is the single strongest predictor of breeding success in our dataset. Colonies that retained stable fast ice until 15 December fledged an average of 0.72 chicks per pair, whereas colonies losing ice before 1 December fledged 0.41 chicks per pair. Emperor penguins require roughly 135 days of continuous fast ice to complete a breeding cycle.",
      },
      {
        heading: "Flight protocol",
        page: 48,
        text: "All flights maintained a minimum standoff distance of 80 metres vertically and 300 metres laterally from colony edges. Heart-rate loggers deployed on a subsample of twenty birds showed no measurable elevation during overflight, supporting the adoption of this protocol as the Indian standard for coastal seabird surveys.",
      },
    ],
  },
  {
    publicId: "iae-42-maitri-hybrid-power",
    expeditionSlug: "iae-42",
    title: "Commissioning of the Maitri Hybrid Renewable Power System",
    description:
      "Engineering commissioning report for the 250 kW wind–solar–diesel hybrid plant at Maitri, including cold-chamber battery performance and fuel displacement results.",
    author: "Er. Sudhanshu Kale et al.",
    licence: "CC-BY-NC-4.0",
    tags: ["energy", "station life", "infrastructure"],
    year: 2024,
    pageCount: 92,
    sizeBytes: 11_260_000,
    passages: [
      {
        heading: "Fuel displacement",
        page: 15,
        text: "The hybrid plant displaced 61 per cent of Maitri's annual diesel consumption during its first twelve months of operation, saving approximately 152 000 litres of Arctic-grade diesel and avoiding 408 tonnes of carbon dioxide equivalent. Wind provided 74 per cent of the renewable fraction, solar the remaining 26 per cent, with solar output falling to near zero for the eleven weeks of polar night.",
      },
      {
        heading: "Battery behaviour at −40 °C",
        page: 52,
        text: "Lithium-iron-phosphate cells housed in the heated energy hut retained 96 per cent of rated capacity at an internal temperature of −8 °C, but suffered a 22 per cent capacity loss during a nine-hour enclosure heater failure in July. We now specify a redundant heater circuit and passive insulation rated to −55 °C for any future polar battery installation.",
      },
      {
        heading: "Recommendation",
        page: 88,
        text: "We recommend that Bharati be retrofitted with an identical 250 kW hybrid array, and that a 500 kilowatt-hour second-life battery bank be trialled at Maitri before the next resupply season to test economics under real cycling conditions.",
      },
    ],
  },
  {
    publicId: "iae-42-black-carbon-schirmacher",
    expeditionSlug: "iae-42",
    title: "Twelve Seasons of Surface Ozone and Black Carbon at Schirmacher Oasis",
    description:
      "Long-record atmospheric chemistry assessment from the Maitri observatory covering 2012–2024, with source attribution by back-trajectory clustering.",
    author: "Dr. Ravindra Khole et al.",
    licence: "CC-BY-4.0",
    tags: ["aerosols", "black carbon", "atmosphere"],
    year: 2024,
    pageCount: 134,
    sizeBytes: 15_940_000,
    passages: [
      {
        heading: "Record summary",
        page: 7,
        text: "Aethalometer measurements at Maitri show a mean black carbon concentration of 3.4 nanograms per cubic metre over twelve austral summers, an order of magnitude below mid-latitude background levels. Episodic spikes above 40 nanograms per cubic metre occur on average eleven times per season and are associated with long-range transport from southern South America and, less frequently, biomass burning in equatorial Africa.",
      },
      {
        heading: "Surface ozone",
        page: 61,
        text: "Surface ozone at Schirmacher Oasis averaged 26.2 parts per billion with a weak spring maximum in October. Unlike Arctic sites, we find no evidence of catastrophic springtime ozone depletion events, which we attribute to the absence of bromine sources on the local ice surface and to the distance from the coastal polynya belt.",
      },
      {
        heading: "Station contamination test",
        page: 110,
        text: "Diesel generator exhaust at Maitri was detected as a 6 nanogram per cubic metre black carbon enhancement when winds blew from the station's power house sector, a measurable local artefact. We recommend relocating the intake stack 900 metres upwind during the next observatory refurbishment.",
      },
    ],
  },
  {
    publicId: "iae-41-krill-biomass-sea-ice",
    expeditionSlug: "iae-41",
    title: "Krill Biomass and Sea-Ice Extent Along the 65°E Transect, IAE-41",
    description:
      "Acoustic survey of Antarctic krill standing stock and its relationship to sea-ice extent, chlorophyll and carbonate chemistry in the Cooperation Sea.",
    author: "Dr. Melinda Fernandes et al.",
    licence: "CC-BY-4.0",
    tags: ["krill", "sea ice", "oceanography", "biodiversity"],
    year: 2023,
    pageCount: 156,
    sizeBytes: 18_620_000,
    passages: [
      {
        heading: "Standing stock",
        page: 22,
        text: "Echo-integration surveys along the 65°E transect produced a krill standing-stock estimate of 4.1 million tonnes in the Cooperation Sea survey box, with a 95 per cent confidence interval of 2.8 to 5.9 million tonnes. Mean areal density was 21.4 grams per square metre, roughly one third of the density reported for the South Atlantic sector.",
      },
      {
        heading: "Sea-ice link",
        page: 58,
        text: "Krill recruitment in our survey region is tightly coupled to the duration of the previous winter's sea-ice cover. Years with more than 180 days of sea ice above 60°S produced strong one-year-old cohorts, whereas the ice-poor summer of 2016–17 produced a cohort failure that is still visible in the current length-frequency distribution as a missing 42 millimetre mode.",
      },
      {
        heading: "Carbonate chemistry",
        page: 101,
        text: "Seawater aragonite saturation state in the upper 100 metres ranged from 1.42 to 1.68, already below the 1.7 threshold associated with krill larval stress. Laboratory incubations showed a 14 per cent reduction in larval moult frequency at a saturation state of 1.4 relative to 1.8, suggesting that acidification acts on krill primarily through larval development rather than adult mortality.",
      },
      {
        heading: "Fisheries implication",
        page: 140,
        text: "If the winter sea-ice season shortens by a further 30 days, our recruitment model projects a 24 per cent decline in exploitable krill biomass in the Indian Ocean sector by 2050, with consequences for the entire predator community including emperor penguins, fur seals and fishery quotas set by the Commission for the Conservation of Antarctic Marine Living Resources.",
      },
    ],
  },
  {
    publicId: "iae-40-ice-core-palaeoclimate",
    expeditionSlug: "iae-40",
    title: "A 180 m Ice Core from the Schirmacher Ice Shelf: Palaeoclimate Bulletin",
    description:
      "Stable isotope, dust and chemistry stratigraphy of the IAE-40 core, reconstructing the last 380 years of regional climate variability.",
    author: "Dr. Thamban Meloth et al.",
    licence: "CC-BY-4.0",
    tags: ["ice core", "palaeoclimate", "climate", "drilling"],
    year: 2022,
    pageCount: 178,
    sizeBytes: 22_450_000,
    passages: [
      {
        heading: "Core recovery",
        page: 18,
        text: "A 180.4 metre core was recovered from the ice shelf adjacent to the Schirmacher Oasis using the NCPOR thermal drill, achieving 98.6 per cent recovery. Volcanic reference horizons from Tambora in 1815 and Krakatoa in 1883 anchor the age scale, giving a basal age of approximately 380 years before present and a mean annual accumulation of 0.34 metres of water equivalent.",
      },
      {
        heading: "Temperature reconstruction",
        page: 74,
        text: "Deuterium excess corrected oxygen-18 ratios show a warming of 1.8 degrees Celsius since 1950 in the core record, with the warmest thirty-year window in the entire 380-year series occurring between 1991 and 2020. The reconstruction is consistent with instrumental records from Novolazarevskaya station, giving a correlation coefficient of 0.82 for overlapping periods.",
      },
      {
        heading: "Dust and sea salt",
        page: 121,
        text: "Non-sea-salt calcium concentrations, a tracer for continental dust, doubled after 1970 relative to the pre-industrial baseline, while sea-salt sodium shows a weaker but coherent rise that we interpret as an increase in open-water fetch as sea ice retreats along the coast.",
      },
    ],
  },
  {
    publicId: "iae-39-unattended-magnetometer-array",
    expeditionSlug: "iae-39",
    title: "Servicing Report: Unattended Magnetometer Array, Larsemann Hills",
    description:
      "Pandemic-constrained servicing of the three-station fluxgate magnetometer array and its first substorm climatology for the Indian Antarctic sector.",
    author: "Dr. S. Rajan et al.",
    licence: "CC-BY-4.0",
    tags: ["space weather", "aurora", "magnetosphere"],
    year: 2021,
    pageCount: 58,
    sizeBytes: 6_310_000,
    passages: [
      {
        heading: "Array status",
        page: 6,
        text: "All three fluxgate magnetometers in the Larsemann Hills array were recovered with full data for 411 of 420 days, a 97.6 per cent data return despite a reduced team and no mid-winter servicing visit. The single gap was caused by a data-logger firmware fault at the western site, now patched across the network.",
      },
      {
        heading: "Substorm climatology",
        page: 29,
        text: "We identified 1 218 substorm onsets in the magnetic local time sector 20:00 to 02:00, with a pronounced semiannual variation peaking at the equinoxes. Auroral electrojet currents during the largest events exceeded 1 400 nanotesla of deflection, sufficient to induce currents in the Bharati station earthing grid.",
      },
      {
        heading: "Operational relevance",
        page: 51,
        text: "Because Bharati relies on satellite communication for all voice and data traffic, substorm-driven scintillation is an operational risk. We recommend that station communication schedules avoid the 21:00 to 01:00 magnetic local time window during geomagnetically active periods, when our records show a threefold increase in link dropout.",
      },
    ],
  },
  {
    publicId: "iae-38-auv-under-fast-ice",
    expeditionSlug: "iae-38",
    title: "First Indian AUV Deployment Under Antarctic Fast Ice",
    description:
      "Trial report for the 200 m rated autonomous underwater vehicle transects beneath 1.4 m fast ice in the Prydz Bay embayment.",
    author: "Dr. Ajit Shetye et al.",
    licence: "CC-BY-NC-4.0",
    tags: ["technology", "oceanography", "sea ice"],
    year: 2020,
    pageCount: 71,
    sizeBytes: 12_800_000,
    passages: [
      {
        heading: "Mission summary",
        page: 11,
        text: "The vehicle completed eleven successful missions under 1.4 metre thick fast ice, covering 74 linear kilometres and returning 96 hours of continuous CTD, dissolved oxygen and chlorophyll fluorescence data. Acoustic homing through the ice worked reliably to a range of 900 metres, which defined our operational envelope.",
      },
      {
        heading: "Under-ice hydrography",
        page: 44,
        text: "Beneath the fast ice we found a 28 metre thick layer of winter water at −1.86 degrees Celsius overlying a modified Circumpolar Deep Water intrusion of +0.9 degrees Celsius. The interface was sharpened by tidal mixing at the sill, with vertical heat fluxes of 8.2 watts per square metre, sufficient to melt 0.4 metres of ice per year at the base.",
      },
      {
        heading: "Lessons",
        page: 66,
        text: "Ice keel contact was the dominant hazard: two missions aborted on the upward-looking sonar's obstacle alarm. We recommend a 4 metre minimum standoff altitude and a dedicated under-ice mission planner before the next deployment season.",
      },
    ],
  },
  {
    publicId: "iae-37-sar-calibration-larsemann",
    expeditionSlug: "iae-37",
    title: "SAR Calibration and Glacier Velocity Mapping, Larsemann Hills",
    description:
      "Corner-reflector calibration of RISAT-1B and Sentinel-1 acquisitions over the Larsemann Hills, with a five-year ice velocity inventory.",
    author: "Dr. Prakash K. et al.",
    licence: "CC-BY-4.0",
    tags: ["remote sensing", "sar", "glaciology"],
    year: 2019,
    pageCount: 103,
    sizeBytes: 17_240_000,
    passages: [
      {
        heading: "Calibration result",
        page: 14,
        text: "Six trihedral corner reflectors deployed on bedrock islands in the Larsemann Hills gave an absolute radiometric calibration of RISAT-1B C-band imagery to within 0.9 decibels, meeting the 1 decibel requirement for quantitative ice applications. Reflector stability over the austral summer was better than 0.2 decibels.",
      },
      {
        heading: "Velocity inventory",
        page: 62,
        text: "Feature-tracked velocities from 214 Sentinel-1 image pairs resolve 47 glaciers in the Indian sector. Peak velocities of 412 metres per year occur on the largest outlet glacier, while the median glacier in our inventory moves at 61 metres per year. Six glaciers show a statistically significant acceleration exceeding 5 per cent per year since 2015.",
      },
      {
        heading: "Data release",
        page: 97,
        text: "The complete velocity inventory is released as a NetCDF collection with per-pixel error estimates, and we encourage its use as a validation reference for the forthcoming Indian polar orbit altimetry mission.",
      },
    ],
  },
  {
    publicId: "iae-36-human-physiology-telemedicine",
    expeditionSlug: "iae-36",
    title: "Human Physiology and Telemedicine Trials at Maitri",
    description:
      "Winter-over physiological monitoring of 24 expeditioners, cold-injury epidemiology and the first telemedicine link to AIIMS New Delhi.",
    author: "Dr. Bhaskar Rao et al.",
    licence: "CC-BY-NC-4.0",
    tags: ["human factors", "medical", "station life"],
    year: 2018,
    pageCount: 88,
    sizeBytes: 8_930_000,
    passages: [
      {
        heading: "Cohort findings",
        page: 20,
        text: "Across 24 winter-over expeditioners we recorded a mean 4.7 per cent increase in body mass during the nine-month isolation period, a 9 per cent reduction in maximal oxygen uptake on the treadmill test, and a 12 per cent increase in reported sleep disturbance during polar night. Mood scores dipped most sharply in weeks six to nine of continuous darkness.",
      },
      {
        heading: "Cold injury",
        page: 47,
        text: "Nineteen superficial cold injuries were recorded, sixteen of them affecting the fingers during fuelling and rope work. All injuries were minor. The incidence rate fell by 41 per cent after the introduction of scheduled warm-up rotations, which we now mandate for any outdoor task longer than thirty minutes below −30 °C.",
      },
      {
        heading: "Telemedicine",
        page: 79,
        text: "The satellite telemedicine link to AIIMS New Delhi handled 63 consultations during the winter, with a median latency of 640 milliseconds. Two dental and one dermatological case avoided evacuation, saving an estimated 1.8 crore rupees in emergency airlift costs.",
      },
    ],
  },
  {
    publicId: "iae-35-aurora-optical-campaign",
    expeditionSlug: "iae-35",
    title: "Optical Aurora Campaign Log, Bharati Station",
    description:
      "All-sky imager and meridian scanning photometer observations of auroral forms over two austral winters at Bharati.",
    author: "Dr. N. Rajeew et al.",
    licence: "CC-BY-4.0",
    tags: ["aurora", "space weather", "optical"],
    year: 2017,
    pageCount: 96,
    sizeBytes: 21_370_000,
    passages: [
      {
        heading: "Observation statistics",
        page: 13,
        text: "The Bharati all-sky imager recorded 1 412 hours of auroral activity across two austral winters, of which 96 hours were classified as bright pulsating aurora. The local magnetic latitude of 74.4 degrees south places the station equatorward of the standard auroral oval for most quiet-time conditions, so activity is dominated by disturbed-period events.",
      },
      {
        heading: "Pulsating aurora",
        page: 55,
        text: "Pulsating aurora occurred on 71 per cent of nights with geomagnetic activity index above 3, typically between 03:00 and 07:00 magnetic local time. On-off modulation periods clustered between 2.4 and 6.1 seconds, consistent with chorus-wave driven precipitation of energetic electrons in the outer radiation belt.",
      },
      {
        heading: "Public engagement",
        page: 90,
        text: "Forty-one time-lapse sequences from this campaign were cleared for public release and have since been used in school outreach programmes reaching an estimated 180 000 students across India through the MoES polar science lecture series.",
      },
    ],
  },
  {
    publicId: "iae-33-bharati-commissioning",
    expeditionSlug: "iae-33",
    title: "Bharati Station Commissioning: Materials, Waste Water and Wind Loading",
    description:
      "Commissioning validation report covering the cold-region composite facade, containerised waste-water treatment and the extreme wind load cases for Bharati.",
    author: "Er. Meera Iyer et al.",
    licence: "CC-BY-4.0",
    tags: ["infrastructure", "energy", "station life"],
    year: 2015,
    pageCount: 145,
    sizeBytes: 19_120_000,
    passages: [
      {
        heading: "Facade performance",
        page: 26,
        text: "The Bharati composite facade maintained an interior dew point below −2 °C at exterior temperatures of −40 °C with 84 knots of wind, confirming the thermal break design. No condensation was detected within the panel joints after two summers of thermal cycling, validating the 134-layer sandwich specified by the manufacturer.",
      },
      {
        heading: "Waste water",
        page: 88,
        text: "The containerised membrane bioreactor achieved a 99.2 per cent reduction in chemical oxygen demand and complete retention of faecal coliforms, meeting the Antarctic Treaty Protocol on Environmental Protection requirement that no untreated effluent be discharged into the marine environment.",
      },
      {
        heading: "Wind loading",
        page: 132,
        text: "Peak gust recorded during commissioning was 96 knots from the south-south-east, below the 130 knot design case. Snow drifting against the northern container stack requires annual clearing of approximately 380 cubic metres, which we schedule before the resupply vessel arrives.",
      },
    ],
  },
];
