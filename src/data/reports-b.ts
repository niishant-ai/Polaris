import type { SeedReport } from "@/data/reports-a";

export const REPORTS_B: SeedReport[] = [
  {
    publicId: "iae-30-meltwater-discharge",
    expeditionSlug: "iae-30",
    title: "Meltwater Discharge from the Schirmacher Catchment to Prydz Bay",
    description:
      "Hydrological season report quantifying freshwater flux from 43 supraglacial lakes and three proglacial streams in the Schirmacher Oasis catchment.",
    author: "Dr. Shailesh Nayak et al.",
    licence: "CC-BY-4.0",
    tags: ["hydrology", "salinity", "climate"],
    year: 2012,
    pageCount: 79,
    sizeBytes: 8_120_000,
    passages: [
      {
        heading: "Discharge estimate",
        page: 17,
        text: "Total meltwater discharge from the Schirmacher catchment for the 2011–12 ablation season was 6.4 million cubic metres, of which 71 per cent left the catchment between 10 January and 22 February. Peak daily discharge of 214 000 cubic metres was recorded on 4 February following a five-day warm spell with maximum air temperature of 6.2 degrees Celsius.",
      },
      {
        heading: "Lake inventory",
        page: 44,
        text: "Forty-three supraglacial lakes were mapped from RapidEye imagery; nine of them drained fully at least once during the season. Drainage events were consistently preceded by a surface-area increase of more than 18 per cent over ten days, offering a practical early-warning indicator observable from satellite.",
      },
      {
        heading: "Freshwater flux",
        page: 71,
        text: "The freshwater flux we measure represents a 0.6 per mil salinity anomaly in the upper five metres of the adjacent Prydz Bay coastal current, small but non-negligible for local primary production during the austral summer bloom.",
      },
    ],
  },
  {
    publicId: "iae-28-treaty-compliance-audit",
    expeditionSlug: "iae-28",
    title: "Antarctic Treaty Environmental Compliance Audit, Indian Stations",
    description:
      "Audit of waste management, fuel handling and heritage obligations at Maitri and Bharati under the Protocol on Environmental Protection.",
    author: "Dr. Rasik Ravindra et al.",
    licence: "CC-BY-4.0",
    tags: ["policy", "treaty", "environment"],
    year: 2009,
    pageCount: 66,
    sizeBytes: 5_640_000,
    passages: [
      {
        heading: "Waste repatriation",
        page: 12,
        text: "A total of 84 tonnes of waste was repatriated from the Indian Antarctic stations during the 2008–09 season, including 26 tonnes of scrap metal, 11 tonnes of construction debris and 9 400 kilograms of hazardous material. This represents 92 per cent of the accumulated waste inventory identified in the 2006 audit, leaving a residual of 7 tonnes.",
      },
      {
        heading: "Fuel handling",
        page: 38,
        text: "Fuel transfer procedures at both stations were revised after we recorded three minor spill events totalling 210 litres, all during hose coupling in winds above 30 knots. Drip trays and double-valved couplings have since reduced transfer losses by 88 per cent in the following season.",
      },
      {
        heading: "India's treaty role",
        page: 61,
        text: "India's Consultative Party status under the Antarctic Treaty System carries an obligation to demonstrate continuing substantive research activity. The audit concludes that India's environmental compliance record is strong, and recommends that India sponsor a regional waste-management working group for the Larsemann Hills, where six stations operate within 12 kilometres of one another.",
      },
    ],
  },
  {
    publicId: "iae-26-palaeolimnology",
    expeditionSlug: "iae-26",
    title: "Palaeolimnology of Schirmacher Oasis Lakes: 4 000 Years of Record",
    description:
      "Sediment core stratigraphy, diatom assemblages and geochemistry from five lakes in the Schirmacher Oasis.",
    author: "Dr. P. S. Goel et al.",
    licence: "CC-BY-4.0",
    tags: ["sediment", "palaeoclimate", "lake"],
    year: 2007,
    pageCount: 112,
    sizeBytes: 13_560_000,
    passages: [
      {
        heading: "Core stratigraphy",
        page: 21,
        text: "Radiocarbon-dated sediment cores from five Schirmacher lakes span the last 4 100 years. The basal units are glacial till, overlain by 1.9 to 3.4 metres of organic-rich lacustrine mud, indicating that the lakes have been ice-free throughout the entire record despite regional glacial advances.",
      },
      {
        heading: "Diatom shift",
        page: 67,
        text: "A pronounced shift in diatom assemblage composition occurs at approximately 1850 common era, with a 30 per cent decline in benthic fragilarioid taxa and a corresponding rise in planktonic cyclotelloid species. We interpret this as a response to a longer annual ice-free period rather than to nutrient change, which remained stable.",
      },
      {
        heading: "Geochemistry",
        page: 98,
        text: "Titanium to aluminium ratios, a proxy for catchment erosion, show no trend over four millennia, suggesting that the oasis has been geomorphologically stable and that recent lake changes are climatic rather than geological in origin.",
      },
    ],
  },
  {
    publicId: "himadri-2024-kongsfjorden",
    expeditionSlug: "himadri-2024",
    title: "Kongsfjorden Fjord Monitoring and Permafrost Active Layer, Himadri 2024",
    description:
      "Arctic summer campaign report on fjord hydrography, tidal glacier meltwater plumes and active-layer depth on Brøggerhalvøya.",
    author: "Dr. Biswajit Bera et al.",
    licence: "CC-BY-4.0",
    tags: ["arctic", "permafrost", "oceanography"],
    year: 2024,
    pageCount: 124,
    sizeBytes: 15_180_000,
    passages: [
      {
        heading: "Active layer",
        page: 19,
        text: "Active-layer depth measured at 34 grid points on Brøggerhalvøya averaged 92 centimetres in August 2024, an increase of 11 centimetres since 2019. The deepest thaw of 147 centimetres occurred in a well-drained sediment fan, the shallowest of 58 centimetres in a snowbed hollow that retains drift until late June.",
      },
      {
        heading: "Atlantic water intrusion",
        page: 63,
        text: "Hydrographic sections at the fjord mouth recorded Atlantic-origin water warmer than 4 degrees Celsius occupying the layer between 30 and 90 metres, the warmest such intrusion in the Himadri record. The resulting meltwater plume from the tidewater glacier at the fjord head was traced 11 kilometres down-fjord by its low salinity signature of 29.4 practical salinity units.",
      },
      {
        heading: "Mercury",
        page: 104,
        text: "Atmospheric gaseous mercury depletion events were observed on 23 days of the spring campaign, with concentrations falling from a background of 1.55 to a minimum of 0.42 nanograms per cubic metre during bromine-oxide episodes, confirming that the Svalbard coast remains a net mercury deposition zone in spring.",
      },
    ],
  },
  {
    publicId: "himadri-2023-arctic-haze",
    expeditionSlug: "himadri-2023",
    title: "Polar Night Aerosol and Black Carbon at Ny-Ålesund",
    description:
      "Winter campaign report on Arctic haze, new particle formation and comparison with concurrent Himalayan observations at Himansh.",
    author: "Dr. Swati Basu et al.",
    licence: "CC-BY-4.0",
    tags: ["aerosols", "black carbon", "arctic"],
    year: 2023,
    pageCount: 91,
    sizeBytes: 9_670_000,
    passages: [
      {
        heading: "Arctic haze",
        page: 15,
        text: "Equally-spaced aethalometer sampling through the polar night captured the classic Arctic haze maximum in March, when black carbon reached 118 nanograms per cubic metre, thirty-four times the clean-season median. Back trajectories attribute 62 per cent of the haze episodes to Eurasian industrial sources north of 60 degrees latitude.",
      },
      {
        heading: "New particle formation",
        page: 52,
        text: "We recorded 31 new particle formation events during sunlit hours, but none during true polar night, confirming that photochemistry is a prerequisite for nucleation in this environment. Growth rates during events averaged 1.9 nanometres per hour, sufficient to reach cloud condensation nuclei sizes within roughly two days.",
      },
      {
        heading: "Himalayan comparison",
        page: 84,
        text: "Simultaneous observations at Himansh in the Himalaya show black carbon levels 3.6 times higher than at Ny-Ålesund, but the same dominance of biomass-burning aerosol in the absorption Ångström exponent. Deposition of this aerosol onto Himalayan snow reduces snow albedo by an estimated 0.024, equivalent to a 12 day advance in seasonal melt onset.",
      },
    ],
  },
  {
    publicId: "himadri-2022-kronebreen",
    expeditionSlug: "himadri-2022",
    title: "Kronebreen and Kongsvegen Stake Farm and GPR Survey",
    description:
      "Spring glaciology report on stake measurements, ground-penetrating radar profiling and calving-front change detection in northwest Svalbard.",
    author: "Dr. Alaknanda Sanwal et al.",
    licence: "CC-BY-4.0",
    tags: ["glaciology", "mass balance", "arctic"],
    year: 2022,
    pageCount: 87,
    sizeBytes: 11_910_000,
    passages: [
      {
        heading: "Surface mass balance",
        page: 23,
        text: "Stake measurements on Kronebreen and Kongsvegen give a combined surface mass balance of −0.61 metres of water equivalent for the 2021–22 balance year. Snowpack depth at the summit stakes averaged 1.82 metres with a mean density of 380 kilograms per cubic metre, both below the 2010–2020 means.",
      },
      {
        heading: "Ice thickness",
        page: 58,
        text: "Ground-penetrating radar profiles totalling 63 kilometres image a maximum ice thickness of 421 metres beneath the Kronebreen accumulation basin and reveal a subglacial trough that channels basal water toward the calving front, explaining the observed concentration of supraglacial meltwater drainage into that corridor.",
      },
      {
        heading: "Calving front",
        page: 81,
        text: "The combined Kronebreen–Kongsvegen calving front retreated 640 metres between 2020 and 2022, continuing a multidecadal retreat that has now removed 19 per cent of the 1990 terminus position.",
      },
    ],
  },
  {
    publicId: "so-cruise-14-carbonate-transect",
    expeditionSlug: "so-cruise-14",
    title: "Carbonate Chemistry of the Indian Sector, 14th Southern Ocean Expedition",
    description:
      "Meridional transect of dissolved inorganic carbon, alkalinity and iron limitation bioassays from 30°E to 70°E.",
    author: "Dr. Anil Kumar N. et al.",
    licence: "CC-BY-4.0",
    tags: ["carbonate chemistry", "co2", "oceanography"],
    year: 2025,
    pageCount: 168,
    sizeBytes: 20_430_000,
    passages: [
      {
        heading: "CO₂ flux",
        page: 28,
        text: "The Indian sector of the Southern Ocean between 30 and 70 degrees east was a net sink of 0.31 moles of carbon dioxide per square metre per year over the survey period, with the strongest uptake in the Antarctic Circumpolar Current where high wind speeds and cold waters combine. South of the polar front the region was close to neutral.",
      },
      {
        heading: "Iron limitation",
        page: 93,
        text: "Shipboard incubations showed that phytoplankton assemblages south of the polar front were strictly iron limited: iron addition increased chlorophyll by a factor of 3.8, whereas nitrate and phosphate addition produced no measurable response. North of the subantarctic front the community was co-limited by iron and silicic acid.",
      },
      {
        heading: "Acidification trajectory",
        page: 141,
        text: "Repeat occupations of the same stations in 2011, 2020 and 2025 show a pH decline of 0.028 units per decade, faster than the global ocean average. If this rate continues, aragonite saturation in the winter water layer will fall below 1.0 by 2060, with severe consequences for pteropods and, indirectly, for the krill that feed on them.",
      },
    ],
  },
  {
    publicId: "so-cruise-12-co2-mooring",
    expeditionSlug: "so-cruise-12",
    title: "CO₂ Flux Partitioning and Mooring Recovery, 12th Southern Ocean Expedition",
    description:
      "Recovery of three deep moorings and a full-year partitioning of air–sea carbon dioxide flux in the Indian sector.",
    author: "Dr. Sabu Prabhu et al.",
    licence: "CC-BY-4.0",
    tags: ["co2", "moorings", "oceanography"],
    year: 2022,
    pageCount: 118,
    sizeBytes: 14_260_000,
    passages: [
      {
        heading: "Mooring recovery",
        page: 16,
        text: "Three taut-wire moorings deployed the previous season were recovered with 100 per cent instrument return, delivering the first full annual cycle of Acoustic Doppler Current Profiler velocity and partial pressure of carbon dioxide data from the Indian sector of the Antarctic Circumpolar Current.",
      },
      {
        heading: "Seasonal cycle",
        page: 71,
        text: "The partial pressure of carbon dioxide in surface water followed a clear annual cycle, rising 42 microatmospheres between midsummer and late winter as cooling deepened the mixed layer and entrained carbon-rich water from below. The ocean becomes a stronger sink in winter than in summer, contrary to the intuition built from temperate seas.",
      },
      {
        heading: "Instrument note",
        page: 108,
        text: "Biofouling on the carbonate sensor guard reduced data quality by an average of 7 per cent after nine months of deployment. We now specify copper-alloy guards and a six-month turnaround interval.",
      },
    ],
  },
  {
    publicId: "so-cruise-10-bio-optical",
    expeditionSlug: "so-cruise-10",
    title: "Bio-optical Validation of Ocean Colour Satellites at High Latitude",
    description:
      "In-water radiometry, chlorophyll profiling and the first Indian under-ice chlorophyll dataset from the Southern Ocean.",
    author: "Dr. C. P. Rajan et al.",
    licence: "CC-BY-4.0",
    tags: ["remote sensing", "phytoplankton", "chlorophyll"],
    year: 2020,
    pageCount: 94,
    sizeBytes: 16_880_000,
    passages: [
      {
        heading: "Validation result",
        page: 25,
        text: "Match-ups between in-water radiometry and satellite ocean colour retrievals show that standard atmospheric correction algorithms overestimate remote-sensing reflectance by 14 per cent in Southern Ocean waters, largely because of the bright subantarctic fog and the low chlorophyll, high detritus optical signature peculiar to these waters.",
      },
      {
        heading: "Under-ice chlorophyll",
        page: 66,
        text: "Under-ice profiling at eleven stations found substantial chlorophyll maxima located 20 to 40 metres below the ice-water interface, with concentrations up to 4.8 milligrams per cubic metre. These maxima are invisible to satellites, implying that Southern Ocean primary production is systematically underestimated by ice-free retrievals.",
      },
      {
        heading: "Regional algorithm",
        page: 90,
        text: "We propose a regionally tuned chlorophyll algorithm that reduces retrieval bias from 14 to 3 per cent for waters south of 50 degrees south, and we release the tuning coefficients for operational use by the Indian satellite oceanography programme.",
      },
    ],
  },
  {
    publicId: "himansh-2025-mass-balance",
    expeditionSlug: "himansh-2025",
    title: "Chhota Shigri and Satopanth Mass Balance, Post-monsoon 2025",
    description:
      "Stake-based mass balance, black carbon deposition and energy balance flux tower results from the Himansh high-altitude observatory.",
    author: "Dr. Mohd Farooq Azam et al.",
    licence: "CC-BY-4.0",
    tags: ["himalaya", "mass balance", "black carbon", "energy balance"],
    year: 2025,
    pageCount: 132,
    sizeBytes: 15_740_000,
    passages: [
      {
        heading: "Mass balance",
        page: 24,
        text: "Chhota Shigri glacier recorded a mass balance of −0.86 metres of water equivalent for the 2024–25 balance year, the fourth consecutive negative year. Satopanth glacier in the Alaknanda basin was more negative at −1.12 metres of water equivalent. Across the Chandra basin the 2025 aggregate is −0.72 metres of water equivalent.",
      },
      {
        heading: "Black carbon on snow",
        page: 77,
        text: "Snow samples collected from 4 900 to 5 400 metres contained 320 to 1 480 nanograms of black carbon per gram of snow, with the highest values downwind of the Kullu valley. Radiative transfer modelling indicates this loading reduces snow albedo by 0.022 to 0.048, advancing melt onset by six to eleven days at the elevation band where the samples were taken.",
      },
      {
        heading: "Energy balance",
        page: 118,
        text: "The flux tower at 5 050 metres shows net radiation accounts for 81 per cent of the melt energy available at the surface, with sensible heat contributing 14 per cent and latent heat 5 per cent. Because net radiation dominates, albedo reduction from deposited black carbon is the single most effective lever on total melt in this basin.",
      },
    ],
  },
  {
    publicId: "himansh-2024-monsoon-snow-chemistry",
    expeditionSlug: "himansh-2024",
    title: "Monsoon Snow Chemistry and Debris-Covered Glacier Thermal Regime",
    description:
      "Investigation of monsoon-onset snow chemistry, supraglacial debris thermal properties and discharge gauging in the Chandra basin.",
    author: "Dr. Shakti S. Pandey et al.",
    licence: "CC-BY-4.0",
    tags: ["himalaya", "hydrology", "debris cover", "snow chemistry"],
    year: 2024,
    pageCount: 108,
    sizeBytes: 13_070_000,
    passages: [
      {
        heading: "Monsoon onset chemistry",
        page: 31,
        text: "Snow collected during the first monsoon incursions of July contained 2.4 times more calcium and 3.1 times more sulphate than pre-monsoon snow, reflecting the transport of mineral dust and anthropogenic sulphur from the Indo-Gangetic Plain once the monsoon circulation is established.",
      },
      {
        heading: "Debris thickness threshold",
        page: 69,
        text: "Measurements across 61 points on a debris-covered glacier tongue show that melt rates increase with debris thickness up to 2.4 centimetres and decrease beyond it, with the classic insulating threshold falling at approximately 3 centimetres in this basin. Mean debris thickness on the tongue is 11 centimetres, so the tongue as a whole is insulated.",
      },
      {
        heading: "Discharge",
        page: 102,
        text: "Gauged discharge in the Chandra river above the confluence peaked at 148 cubic metres per second on 18 August 2024, 21 per cent above the 2015–2023 mean peak. Melt contributed an estimated 63 per cent of total annual flow in this basin.",
      },
    ],
  },
  {
    publicId: "gangotri-2023-retreat",
    expeditionSlug: "gangotri-2023",
    title: "Gangotri Glacier Snout Monitoring and GPR Depth Sounding",
    description:
      "Pre-monsoon field report on snout position, ground-penetrating radar ice thickness and stake validation against Sentinel-1 velocities.",
    author: "Dr. D. P. Dobhal et al.",
    licence: "CC-BY-4.0",
    tags: ["glaciology", "retreat", "remote sensing", "himalaya"],
    year: 2023,
    pageCount: 74,
    sizeBytes: 10_240_000,
    passages: [
      {
        heading: "Snout retreat",
        page: 18,
        text: "The Gangotri glacier snout retreated 28 metres between October 2022 and May 2023, continuing a retreat that has totalled 346 metres since 2004. The retreat rate is not accelerating, but thinning of 0.94 metres of water equivalent per year in the lower ablation zone is now the dominant mode of ice loss on this glacier.",
      },
      {
        heading: "Ice thickness",
        page: 52,
        text: "Ground-penetrating radar survey along 19 profiles gives a maximum ice thickness of 265 metres and a total glacier volume of 20.4 cubic kilometres for the main trunk, allowing the first volume-anchored projection of the glacier's response to warming.",
      },
      {
        heading: "Satellite agreement",
        page: 71,
        text: "Stake-derived surface velocities agree with Sentinel-1 feature-tracked velocities to within 11 per cent at all eight validation sites, giving us confidence in using the satellite record to extend the field series back in time and to unsurveyed tributaries.",
      },
    ],
  },
  {
    publicId: "iae-42-maitri-logistics-rationing",
    expeditionSlug: "iae-42",
    title: "Maitri Logistics, Resupply and Rationing Report",
    description:
      "Operational report on the 2023–24 resupply, cargo handling at the ice shelf edge, and station provisioning including the winter kitchen plan.",
    author: "Lt. Col. (Retd.) H. S. Bisht et al.",
    licence: "CC-BY-NC-4.0",
    tags: ["logistics", "station life", "food"],
    year: 2024,
    pageCount: 61,
    sizeBytes: 6_780_000,
    passages: [
      {
        heading: "Resupply",
        page: 9,
        text: "The resupply vessel offloaded 412 tonnes of cargo and 268 000 litres of diesel across nineteen working days at the ice edge, with 71 helicopter sorties and 46 over-sled traverses. Weather downtime consumed 34 per cent of the available window, within the ten-year planning norm of 30 to 40 per cent.",
      },
      {
        heading: "Provisioning and kitchen",
        page: 37,
        text: "The winter kitchen plan provides 2 850 kilocalories per person per day for 28 expeditioners over nine months, with fresh produce from the Maitri greenhouse supplementing 41 kilograms of salad crops across the winter. Frozen rations total 11.4 tonnes; the most requested item in the post-winter survey was, for the ninth consecutive year, fresh fruit.",
      },
      {
        heading: "Waste and water",
        page: 56,
        text: "Grey water recycling now supplies 38 per cent of station water demand, up from 12 per cent, following the installation of a second treatment module. Per capita water use fell from 78 to 51 litres per day, achieved largely through a low-flow shower schedule.",
      },
    ],
  },
];
