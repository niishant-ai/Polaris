export type SeedMedia = {
  publicId: string;
  expeditionSlug: string;
  kind: "image" | "video" | "dataset";
  title: string;
  description: string;
  tags: string[];
  year: number;
  author: string;
  licence: string;
  sizeBytes: number;
  pageCount?: number;
  durationSeconds?: number;
  rows?: number;
  columns?: string[];
  format?: string;
};

const img = (
  publicId: string,
  expeditionSlug: string,
  title: string,
  description: string,
  tags: string[],
  year: number,
  sizeBytes = 4_800_000,
): SeedMedia => ({
  publicId,
  expeditionSlug,
  kind: "image",
  title,
  description,
  tags,
  year,
  author: "ESSO-NCPOR Photographic Archive",
  licence: "CC-BY-4.0",
  sizeBytes,
});

export const SEED_IMAGES: SeedMedia[] = [
  img("iae-43-bharati-aurora-panorama", "iae-43", "Auroral arc over Bharati station, 03:42 MLT", "Twelve-frame panorama of a stable auroral arc above the Bharati main module during a 410 nT substorm.", ["aurora", "station life", "space weather"], 2025, 22_400_000),
  img("iae-43-apr-11-drone-orthomosaic", "iae-43", "Emperor penguin colony orthomosaic, Svenner Islands", "Drone orthomosaic at 80 m altitude used for the 8 340-pair colony count.", ["penguin", "census", "biodiversity", "remote sensing"], 2025, 61_900_000),
  img("iae-43-presice-array-install", "iae-43", "Phase-sensitive radar array installation", "Team bolting an autonomous ApRES unit into the firn at kilometre 92 of the Ingrid Christensen traverse.", ["glaciology", "technology"], 2025, 8_120_000),
  img("iae-43-ice-shelf-crevasse-field", "iae-43", "Crevasse field at the grounding zone", "Surface expression of dynamic thinning in a hotspot outlet glacier, photographed from a Twin Otter.", ["glaciology", "mass balance"], 2025, 12_600_000),
  img("iae-43-sea-ice-camp", "iae-43", "Sea-ice field camp at 68°S", "Three-day camp on 1.4 m fast ice during the AUV support mission.", ["sea ice", "logistics"], 2025, 6_400_000),
  img("iae-43-bharati-aerial", "iae-43", "Bharati station from the air", "Aerial view of the 134-container Bharati complex in the Larsemann Hills.", ["station life", "infrastructure"], 2025, 9_800_000),
  img("iae-42-maitri-wind-turbines", "iae-42", "Maitri hybrid wind array", "The 250 kW wind–solar–diesel hybrid plant commissioned in January 2024.", ["energy", "infrastructure"], 2024, 7_300_000),
  img("iae-42-aethalometer-intake", "iae-42", "Aethalometer intake stack, Maitri", "The atmospheric observatory whose 12-season black carbon record is summarised in the 2024 report.", ["aerosols", "black carbon"], 2024, 3_100_000),
  img("iae-42-greenhouse-harvest", "iae-42", "Maitri greenhouse first harvest", "Salad greens harvested 41 kg through the polar night, photographed under grow lights.", ["station life", "food"], 2024, 2_700_000),
  img("iae-42-resupply-helo", "iae-42", "Helicopter sortie at the ice edge", "Cargo transfer from the resupply vessel to the ice shelf during a 22-knot window.", ["logistics", "resupply"], 2024, 5_500_000),
  img("iae-42-schirmacher-lakes", "iae-42", "Supraglacial lakes of the Schirmacher Oasis", "Forty-three mapped lakes, nine of which drained during the ablation season.", ["hydrology", "lake"], 2024, 11_200_000),
  img("iae-41-krill-trawl-catch", "iae-41", "Krill trawl catch on deck", "A 12 kg sample of Euphausia superba from the 65°E transect, sorted by length class.", ["krill", "biodiversity"], 2023, 4_200_000),
  img("iae-41-ctd-rosette", "iae-41", "CTD rosette recovery", "Twenty-four-bottle rosette coming aboard during carbonate chemistry sampling.", ["oceanography", "carbonate chemistry"], 2023, 6_900_000),
  img("iae-41-sea-ice-edge", "iae-41", "Sea-ice edge at 65°E", "Marginal ice zone during the acoustic survey, with a lead system extending 30 km.", ["sea ice", "krill"], 2023, 7_700_000),
  img("iae-41-penguin-colony-2019", "iae-41", "Emperor penguin colony baseline survey", "The 2019 ground count used as the baseline against which the 2024–25 decline was measured.", ["penguin", "census"], 2023, 8_400_000),
  img("iae-40-thermal-drill-rig", "iae-40", "Thermal drill rig on the Schirmacher ice shelf", "The NCPOR thermal drill that recovered the 180.4 m palaeoclimate core.", ["ice core", "drilling", "technology"], 2022, 5_900_000),
  img("iae-40-ice-core-sections", "iae-40", "Bagged ice-core sections in the field", "Core sections staged for shipment to the Goa cold laboratory.", ["ice core", "palaeoclimate"], 2022, 9_100_000),
  img("iae-39-magnetometer-site", "iae-39", "Fluxgate magnetometer, western site", "One of three array stations that achieved a 97.6 per cent data return.", ["space weather", "technology"], 2021, 3_800_000),
  img("iae-38-auv-launch", "iae-38", "AUV launch through fast ice", "The vehicle being lowered through a 1.4 m auger hole before its first under-ice mission.", ["technology", "sea ice", "oceanography"], 2020, 6_100_000),
  img("iae-38-under-ice-ctd", "iae-38", "Under-ice CTD profile display", "Real-time screen capture showing the −1.86 °C winter water layer.", ["oceanography", "technology"], 2020, 1_900_000),
  img("iae-37-corner-reflector", "iae-37", "Trihedral corner reflector on bedrock", "One of six reflectors used to calibrate RISAT-1B to within 0.9 dB.", ["sar", "remote sensing"], 2019, 4_600_000),
  img("iae-37-velocity-map", "iae-37", "Glacier velocity inventory poster", "Feature-tracked velocities for 47 glaciers, rendered as a 200 dpi map plate.", ["remote sensing", "glaciology"], 2019, 18_300_000),
  img("iae-36-treadmill-test", "iae-36", "Winter-over physiology treadmill test", "A volunteer completing the maximal oxygen uptake protocol in the Maitri gym module.", ["human factors", "medical"], 2018, 2_400_000),
  img("iae-36-telemedicine-link", "iae-36", "Telemedicine console at Maitri", "The AIIMS New Delhi link that handled 63 consultations during the winter.", ["medical", "station life"], 2018, 2_100_000),
  img("iae-35-all-sky-imager", "iae-35", "All-sky imager dome, Bharati", "The fisheye dome through which 1 412 hours of auroral activity were recorded.", ["aurora", "optical", "space weather"], 2017, 3_400_000),
  img("iae-35-pulsating-aurora-frame", "iae-35", "Pulsating aurora, 04:17 MLT", "A single 4-second exposure from the pulsating aurora sequence released for public outreach.", ["aurora", "outreach"], 2017, 5_200_000),
  img("himadri-2024-active-layer-grid", "himadri-2024", "Active-layer thaw grid, Brøggerhalvøya", "Thaw probe at grid point 22 where active-layer depth reached 147 cm.", ["permafrost", "arctic"], 2024, 4_100_000),
  img("himadri-2024-ny-alesund-winter", "himadri-2024", "Ny-Ålesund under snow", "The international research settlement that hosts the Himadri station.", ["arctic", "station life"], 2024, 6_600_000),
  img("himadri-2023-arctic-haze-filter", "himadri-2023", "Arctic haze on a sample filter", "Loaded quartz filter from the March haze maximum, 118 ng m⁻³ black carbon.", ["aerosols", "black carbon", "arctic"], 2023, 2_800_000),
  img("himadri-2022-stake-farm", "himadri-2022", "Stake farm on Kongsvegen", "Spring stake reading in drifting snow at the accumulation basin.", ["glaciology", "mass balance", "arctic"], 2022, 4_900_000),
  img("so-cruise-14-incubation-deck", "so-cruise-14", "Iron limitation incubation deck", "Twenty-four incubation bottles lashed to the ORV Sagar Nidhi rail.", ["phytoplankton", "oceanography"], 2025, 5_700_000),
  img("so-cruise-14-drake-swell", "so-cruise-14", "Drake Passage swell", "A 9 m southwesterly swell photographed from the flying bridge.", ["swell", "logistics"], 2025, 8_800_000),
  img("so-cruise-10-radiometry", "so-cruise-10", "In-water radiometry cast", "Free-fall optical profiler being recovered at a validation station.", ["remote sensing", "chlorophyll"], 2020, 4_300_000),
  img("himansh-2025-flux-tower", "himansh-2025", "Himansh flux tower at 5 050 m", "The four-level eddy covariance tower above the Chhota Shigri ablation zone.", ["energy balance", "himalaya"], 2025, 7_100_000),
  img("himansh-2025-snow-sampling", "himansh-2025", "Black carbon snow sampling", "A researcher bagging a snow sample at 5 300 m for black carbon analysis.", ["black carbon", "himalaya"], 2025, 3_900_000),
  img("gangotri-2023-snout-marker", "gangotri-2023", "Gangotri snout survey marker", "The fixed survey marker from which the 28 m annual retreat was measured.", ["retreat", "glaciology", "himalaya"], 2023, 5_100_000),
];

export const SEED_VIDEOS: SeedMedia[] = [
  { publicId: "iae-43-emperor-colony-timelapse", expeditionSlug: "iae-43", kind: "video", title: "Emperor penguin colony time-lapse, 72 hours", description: "Compressed time-lapse of colony movement during the chick-crèche phase, filmed from a fixed standoff camera.", tags: ["penguin", "biodiversity", "outreach"], year: 2025, author: "ESSO-NCPOR Media Unit", licence: "CC-BY-4.0", sizeBytes: 486_000_000, durationSeconds: 184 },
  { publicId: "iae-43-traverse-aurora-4k", expeditionSlug: "iae-43", kind: "video", title: "Aurora over the Ingrid Christensen traverse, 4K", description: "Nine-minute real-time aurora capture used in the MoES polar science lecture series.", tags: ["aurora", "outreach", "space weather"], year: 2025, author: "ESSO-NCPOR Media Unit", licence: "CC-BY-4.0", sizeBytes: 1_240_000_000, durationSeconds: 542 },
  { publicId: "iae-42-hybrid-power-tour", expeditionSlug: "iae-42", kind: "video", title: "Tour of the Maitri hybrid power plant", description: "Walkthrough with the station engineer explaining the 61 per cent diesel displacement achieved in year one.", tags: ["energy", "station life", "outreach"], year: 2024, author: "Station Engineering Team", licence: "CC-BY-4.0", sizeBytes: 318_000_000, durationSeconds: 411 },
  { publicId: "iae-42-resupply-timelapse", expeditionSlug: "iae-42", kind: "video", title: "Nineteen days of resupply in four minutes", description: "Time-lapse of cargo handling at the ice edge, 71 helicopter sorties and 46 sled traverses.", tags: ["logistics", "resupply"], year: 2024, author: "ESSO-NCPOR Media Unit", licence: "CC-BY-4.0", sizeBytes: 402_000_000, durationSeconds: 246 },
  { publicId: "iae-41-krill-deck-work", expeditionSlug: "iae-41", kind: "video", title: "Krill trawl deck operations", description: "Sorting, measuring and preserving a Euphausia superba catch on the trawl deck.", tags: ["krill", "oceanography"], year: 2023, author: "Dr. Melinda Fernandes", licence: "CC-BY-4.0", sizeBytes: 268_000_000, durationSeconds: 197 },
  { publicId: "iae-40-ice-core-drilling", expeditionSlug: "iae-40", kind: "video", title: "Thermal drilling to 180 metres", description: "Continuous drill footage from the Schirmacher ice shelf core, including the 1815 Tambora horizon.", tags: ["ice core", "drilling"], year: 2022, author: "NCPOR Glaciology Group", licence: "CC-BY-4.0", sizeBytes: 712_000_000, durationSeconds: 688 },
  { publicId: "iae-38-auv-under-ice-mission", expeditionSlug: "iae-38", kind: "video", title: "AUV mission under fast ice", description: "Launch, mission monitoring and recovery of the first Indian under-ice AUV deployment.", tags: ["technology", "sea ice"], year: 2020, author: "Dr. Ajit Shetye", licence: "CC-BY-NC-4.0", sizeBytes: 534_000_000, durationSeconds: 508 },
  { publicId: "himadri-2024-fjord-hydrography", expeditionSlug: "himadri-2024", kind: "video", title: "Kongsfjorden hydrography, CTD station 14", description: "Cast and real-time profile display showing the 4 °C Atlantic water intrusion.", tags: ["oceanography", "arctic"], year: 2024, author: "Himadri Science Team", licence: "CC-BY-4.0", sizeBytes: 194_000_000, durationSeconds: 168 },
  { publicId: "himadri-2023-polar-night", expeditionSlug: "himadri-2023", kind: "video", title: "Polar night at Ny-Ålesund", description: "A quiet sequence of the settlement during the January dark, used to open the outreach film.", tags: ["arctic", "outreach", "station life"], year: 2023, author: "ESSO-NCPOR Media Unit", licence: "CC-BY-4.0", sizeBytes: 388_000_000, durationSeconds: 231 },
  { publicId: "so-cruise-14-storm-drake", expeditionSlug: "so-cruise-14", kind: "video", title: "Crossing the Drake in nine-metre swell", description: "Bridge-cam footage during the heaviest weather of the 14th Southern Ocean Expedition.", tags: ["swell", "logistics", "outreach"], year: 2025, author: "ORV Sagar Nidhi", licence: "CC-BY-4.0", sizeBytes: 452_000_000, durationSeconds: 276 },
  { publicId: "himansh-2025-field-methods", expeditionSlug: "himansh-2025", kind: "video", title: "Field methods above 5 000 metres", description: "Stake reading, snow sampling and flux tower servicing demonstrated for training purposes.", tags: ["himalaya", "mass balance", "training"], year: 2025, author: "Himansh Field Team", licence: "CC-BY-4.0", sizeBytes: 296_000_000, durationSeconds: 385 },
  { publicId: "iae-35-aurora-full-sequence", expeditionSlug: "iae-35", kind: "video", title: "Two winters of aurora, full sequence", description: "The complete public-release aurora compilation, 96 hours of bright activity condensed.", tags: ["aurora", "outreach", "space weather"], year: 2017, author: "Dr. N. Rajeew", licence: "CC-BY-4.0", sizeBytes: 1_910_000_000, durationSeconds: 1224 },
];

export const SEED_DATASETS: SeedMedia[] = [
  { publicId: "ds-apres-ingrid-christensen-2025", expeditionSlug: "iae-43", kind: "dataset", title: "ApRES ice thickness and accumulation, Ingrid Christensen Coast 2024–25", description: "Eleven instrument-seasons of 4-second phase-sensitive radar returns with derived ice thickness and accumulation rates.", tags: ["glaciology", "mass balance", "dataset"], year: 2025, author: "NCPOR Glaciology Group", licence: "CC-BY-4.0", sizeBytes: 2_840_000_000, rows: 1_842_400, columns: ["timestamp", "site_id", "ice_thickness_m", "accumulation_m", "precision_m"], format: "NetCDF" },
  { publicId: "ds-krill-acoustics-65e-2023", expeditionSlug: "iae-41", kind: "dataset", title: "Krill acoustic survey, 65°E transect 2022–23", description: "Echo-integration nautical-area scattering coefficients and biomass estimates with uncertainty.", tags: ["krill", "oceanography", "dataset"], year: 2023, author: "Dr. Melinda Fernandes", licence: "CC-BY-4.0", sizeBytes: 640_000_000, rows: 214_800, columns: ["interval", "lat", "lon", "nasc", "biomass_t", "ci_lower", "ci_upper"], format: "CSV" },
  { publicId: "ds-black-carbon-maitri-2012-2024", expeditionSlug: "iae-42", kind: "dataset", title: "Black carbon and surface ozone, Maitri 2012–2024", description: "Twelve austral seasons of aethalometer and ozone analyser data with back-trajectory cluster labels.", tags: ["aerosols", "black carbon", "dataset"], year: 2024, author: "Maitri Atmospheric Observatory", licence: "CC-BY-4.0", sizeBytes: 118_000_000, rows: 96_400, columns: ["timestamp", "bc_ngm3", "o3_ppb", "trajectory_cluster"], format: "CSV" },
  { publicId: "ds-ice-core-isotopes-iae40", expeditionSlug: "iae-40", kind: "dataset", title: "Stable isotope and chemistry profile, IAE-40 ice core", description: "5 cm resolution δ¹⁸O, deuterium excess, dust and major ion chemistry for the 180.4 m core.", tags: ["ice core", "palaeoclimate", "dataset"], year: 2022, author: "NCPOR Paleoclimate Lab", licence: "CC-BY-4.0", sizeBytes: 86_000_000, rows: 3_608, columns: ["depth_m", "age_yr_bp", "d18o_permil", "dex_permil", "ca_ppb", "na_ppb"], format: "NetCDF" },
  { publicId: "ds-glacier-velocity-inventory", expeditionSlug: "iae-37", kind: "dataset", title: "Glacier velocity inventory, Indian Antarctic sector 2014–2019", description: "Feature-tracked velocities for 47 glaciers with per-pixel error estimates.", tags: ["remote sensing", "sar", "glaciology", "dataset"], year: 2019, author: "SAC / ISRO and NCPOR", licence: "CC-BY-4.0", sizeBytes: 1_420_000_000, rows: 42_600_000, columns: ["lat", "lon", "vx_ma", "vy_ma", "sigma_ma", "pair_id"], format: "NetCDF" },
  { publicId: "ds-southern-ocean-carbonate-2025", expeditionSlug: "so-cruise-14", kind: "dataset", title: "Carbonate chemistry along 30–70°E, Southern Ocean 2025", description: "Discrete dissolved inorganic carbon, total alkalinity, pH and aragonite saturation state from 96 stations.", tags: ["carbonate chemistry", "co2", "oceanography", "dataset"], year: 2025, author: "Dr. Anil Kumar N.", licence: "CC-BY-4.0", sizeBytes: 214_000_000, rows: 4_128, columns: ["station", "lat", "lon", "depth_m", "dic_umolkg", "talk_umolkg", "ph_total", "omega_arag"], format: "CSV" },
  { publicId: "ds-chandra-basin-mass-balance", expeditionSlug: "himansh-2025", kind: "dataset", title: "Chandra basin mass balance and black carbon, 2025", description: "Stake network mass balance, snow black carbon loading and albedo reduction estimates for the Himalayan Chandra basin.", tags: ["himalaya", "mass balance", "black carbon", "dataset"], year: 2025, author: "Himansh Observatory", licence: "CC-BY-4.0", sizeBytes: 92_000_000, rows: 8_940, columns: ["site", "elevation_m", "mass_balance_mwe", "bc_ngg", "albedo_reduction", "melt_advance_days"], format: "CSV" },
];

export type SeedDraftSpec = {
  reportPublicId: string;
  passageIndex: number;
  format: "web" | "social" | "explainer" | "newsletter";
  audience: "public" | "student" | "researcher";
  status: "draft" | "in_review" | "approved" | "published" | "rejected";
  createdBy: string;
  createdByRole: string;
  channel?: "website" | "x" | "instagram" | "linkedin" | "newsletter";
  scheduledFor?: string;
  note?: string;
};

export const SEED_DRAFT_SPECS: SeedDraftSpec[] = [
  { reportPublicId: "iae-43-ice-sheet-mass-balance", passageIndex: 0, format: "web", audience: "public", status: "published", createdBy: "Vikram Mehta", createdByRole: "editor", channel: "website", scheduledFor: "2025-11-18T09:30:00.000Z" },
  { reportPublicId: "iae-43-emperor-penguin-census", passageIndex: 0, format: "social", audience: "public", status: "published", createdBy: "Vikram Mehta", createdByRole: "editor", channel: "x", scheduledFor: "2025-11-22T06:00:00.000Z" },
  { reportPublicId: "iae-41-krill-biomass-sea-ice", passageIndex: 3, format: "explainer", audience: "student", status: "in_review", createdBy: "Vikram Mehta", createdByRole: "editor" },
  { reportPublicId: "himansh-2025-mass-balance", passageIndex: 1, format: "web", audience: "public", status: "in_review", createdBy: "Priya Nair", createdByRole: "editor" },
  { reportPublicId: "so-cruise-14-carbonate-transect", passageIndex: 2, format: "social", audience: "public", status: "approved", createdBy: "Vikram Mehta", createdByRole: "editor" },
  { reportPublicId: "iae-42-maitri-hybrid-power", passageIndex: 0, format: "newsletter", audience: "public", status: "approved", createdBy: "Arjun Bose", createdByRole: "editor" },
  { reportPublicId: "himadri-2024-kongsfjorden", passageIndex: 1, format: "explainer", audience: "student", status: "approved", createdBy: "Priya Nair", createdByRole: "editor" },
  { reportPublicId: "iae-40-ice-core-palaeoclimate", passageIndex: 1, format: "web", audience: "researcher", status: "draft", createdBy: "Dr. Ananya Rao", createdByRole: "editor" },
  { reportPublicId: "gangotri-2023-retreat", passageIndex: 0, format: "social", audience: "public", status: "rejected", createdBy: "Intern Desk", createdByRole: "editor", note: "Headline overstates the retreat rate; the 28 m figure is annual, not cumulative. Please rewrite against paragraph 1 and resubmit." },
  { reportPublicId: "iae-42-maitri-logistics-rationing", passageIndex: 1, format: "social", audience: "public", status: "published", createdBy: "Vikram Mehta", createdByRole: "editor", channel: "instagram", scheduledFor: "2025-12-04T10:00:00.000Z" },
];

export const SEED_ACTIVITY: { actor: string; role: string; action: string; entityType: string; entityLabel: string; hoursAgo: number }[] = [
  { actor: "Vikram Mehta", role: "editor", action: "generated draft", entityType: "draft", entityLabel: "Himalayan black carbon is melting glaciers earlier", hoursAgo: 2 },
  { actor: "Priya Nair", role: "editor", action: "submitted for review", entityType: "draft", entityLabel: "Explainer: why Arctic fjords are warming", hoursAgo: 5 },
  { actor: "S. Krishnan", role: "admin", action: "approved", entityType: "draft", entityLabel: "Southern Ocean is acidifying faster than we thought", hoursAgo: 9 },
  { actor: "Dr. Ananya Rao", role: "editor", action: "ingested asset", entityType: "asset", entityLabel: "Ice-Sheet Mass Balance Along the Ingrid Christensen Coast, IAE-43", hoursAgo: 14 },
  { actor: "Vikram Mehta", role: "editor", action: "published", entityType: "draft", entityLabel: "Antarctic coast is thinning twice as fast", hoursAgo: 26 },
  { actor: "Arjun Bose", role: "editor", action: "scheduled post", entityType: "schedule", entityLabel: "Newsletter · 4 Dec 2025", hoursAgo: 31 },
  { actor: "MoES Programme Officer", role: "admin", action: "exported activity log", entityType: "system", entityLabel: "November 2025 audit export", hoursAgo: 48 },
  { actor: "Intern Desk", role: "editor", action: "draft rejected", entityType: "draft", entityLabel: "Gangotri glacier is disappearing", hoursAgo: 54 },
  { actor: "Dr. Melinda Fernandes", role: "editor", action: "ingested asset", entityType: "asset", entityLabel: "Krill Biomass and Sea-Ice Extent Along the 65°E Transect, IAE-41", hoursAgo: 72 },
  { actor: "S. Krishnan", role: "admin", action: "updated role permissions", entityType: "system", entityLabel: "Editor role may now schedule posts", hoursAgo: 96 },
];
