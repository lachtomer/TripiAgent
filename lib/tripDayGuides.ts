import type { DayGuide, DayGuideFood, DayGuideLocation } from "@/types";

/** Google Maps search URL for a place query */
function maps(q: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

const DAY_2: DayGuide = {
  dayNumber: 2,
  bannerNote:
    "Base: Villa Bella, Desenzano. Pick one en-route stop — Option A Peschiera (~15 min to villa) OR Option B Bergamo (~1.5–2 hr to villa). VRBO check-in from 17:00.",
  options: [
    {
      id: "option-a-virgilio",
      label: "Option A: Lungolago Virgilio (Peschiera)",
      locations: [
        {
          id: "loc-virgilio",
          name: "Lungolago Virgilio",
          mapsUrl: maps("Lungolago Virgilio Peschiera del Garda"),
          mustSee: [
            {
              id: "virgilio-promenade",
              title: "Lakefront promenade",
              detail: "Easy lakeside walk — first Lake Garda views (~45–60 min). ~15 min drive to Desenzano after.",
            },
            {
              id: "virgilio-fortress",
              title: "Peschiera fortress glimpse",
              detail: "Quick photo from the shore path",
            },
            {
              id: "virgilio-waterfront",
              title: "Lakeside cafés & harbor views",
              detail: "Colorful waterfront — same south-shore vibe as Sirmione peninsula",
            },
          ],
        },
        {
          id: "loc-desenzano-evening-a",
          name: "Desenzano del Garda",
          mapsUrl: maps("Desenzano del Garda harbour"),
          mustSee: [
            {
              id: "desenzano-promenade-a",
              title: "Harbour promenade",
              detail: "Evening passeggiata after VRBO check-in — spritz along the lungolago",
            },
            {
              id: "desenzano-market-a",
              title: "Tuesday market (Piazza Malvezzi)",
              detail: "Clothes, cheese, produce — one of the lake's best weekly markets",
              optional: true,
            },
            {
              id: "desenzano-museum-a",
              title: "Archaeological Museum",
              detail: "Roman villa mosaics — optional ~45 min if energy after the drive",
              optional: true,
            },
          ],
        },
      ],
      food: [
        {
          id: "food-virgilio-lunch",
          name: "Lakeside pizza & panini",
          style: "Casual cafés along the promenade",
          when: "lunch",
          mapsUrl: maps("pizza Lungolago Virgilio Peschiera del Garda"),
          isPrimary: true,
          locationId: "loc-virgilio",
        },
        {
          id: "food-ristorante-pace-a",
          name: "Ristorante Pace",
          style: "Lake fish, risotto · waterfront",
          when: "dinner",
          mapsUrl: maps("Ristorante Pace Desenzano del Garda"),
          isPrimary: true,
          locationId: "loc-desenzano-evening-a",
        },
        {
          id: "food-desenzano-pizza-a",
          name: "Lakeside pizzerias",
          style: "Casual pizza along Via Guglielmo Marconi",
          when: "dinner",
          mapsUrl: maps("pizza Desenzano del Garda lungolago"),
          locationId: "loc-desenzano-evening-a",
        },
        {
          id: "food-porto-vecchio-a",
          name: "Vineria Porto Vecchio",
          style: "Wine by the glass · harbour",
          when: "snack",
          mapsUrl: maps("Vineria Porto Vecchio Desenzano del Garda"),
          locationId: "loc-desenzano-evening-a",
        },
        {
          id: "food-la-lepre-a",
          name: "La Lepre",
          style: "Lakefront dinner · elegant plates",
          when: "dinner",
          mapsUrl: maps("La Lepre Desenzano del Garda"),
          locationId: "loc-desenzano-evening-a",
        },
      ],
    },
    {
      id: "option-b-bergamo",
      label: "Option B: Bergamo Upper Town",
      locations: [
        {
          id: "loc-bergamo-alta",
          name: "Bergamo Upper Town",
          mapsUrl: maps("Bergamo Città Alta"),
          websiteUrl: "https://www.visitbergamo.net/en/",
          mustSee: [
            {
              id: "bergamo-piazza-vecchia",
              title: "Old Square (Piazza Vecchia)",
              detail: "One of the prettiest squares in northern Italy",
            },
            {
              id: "bergamo-basilica",
              title: "Santa Maria Maggiore Basilica",
              detail: "Richly decorated cathedral interior",
            },
            {
              id: "bergamo-walls",
              title: "Venetian Walls (UNESCO)",
              detail: "Walk along them for valley views",
            },
            {
              id: "bergamo-campanone",
              title: "Civic Bell Tower (Campanone)",
              detail: "Climb for a panorama over the Alps and plains",
            },
            {
              id: "bergamo-funicular",
              title: "Funicular ride",
              detail: "Lower town ↔ upper town — part of the experience",
            },
          ],
        },
        {
          id: "loc-desenzano-evening-b",
          name: "Desenzano del Garda",
          mapsUrl: maps("Desenzano del Garda harbour"),
          mustSee: [
            {
              id: "desenzano-promenade-b",
              title: "Harbour promenade",
              detail: "Evening passeggiata after VRBO check-in — spritz along the lungolago",
            },
            {
              id: "desenzano-market-b",
              title: "Tuesday market (Piazza Malvezzi)",
              detail: "Clothes, cheese, produce — one of the lake's best weekly markets",
              optional: true,
            },
            {
              id: "desenzano-museum-b",
              title: "Archaeological Museum",
              detail: "Roman villa mosaics — optional ~45 min if energy after the drive",
              optional: true,
            },
          ],
        },
      ],
      food: [
        {
          id: "food-la-bruschetta",
          name: "La Bruschetta",
          style: "Pizza, panini, pasta · casual",
          when: "lunch",
          mapsUrl: maps("La Bruschetta Bergamo Alta"),
          isPrimary: true,
          locationId: "loc-bergamo-alta",
        },
        {
          id: "food-sant-angelo",
          name: "Pizzeria Sant'Angelo",
          style: "Pizza by the slice · casual",
          when: "lunch",
          mapsUrl: maps("Pizzeria Sant Angelo Bergamo"),
          locationId: "loc-bergamo-alta",
        },
        {
          id: "food-ristorante-pace",
          name: "Ristorante Pace",
          style: "Lake fish, risotto · waterfront",
          when: "dinner",
          mapsUrl: maps("Ristorante Pace Desenzano del Garda"),
          isPrimary: true,
          locationId: "loc-desenzano-evening-b",
        },
        {
          id: "food-desenzano-pizza",
          name: "Lakeside pizzerias",
          style: "Casual pizza along Via Guglielmo Marconi",
          when: "dinner",
          mapsUrl: maps("pizza Desenzano del Garda lungolago"),
          locationId: "loc-desenzano-evening-b",
        },
        {
          id: "food-porto-vecchio-b",
          name: "Vineria Porto Vecchio",
          style: "Wine by the glass · harbour",
          when: "snack",
          mapsUrl: maps("Vineria Porto Vecchio Desenzano del Garda"),
          locationId: "loc-desenzano-evening-b",
        },
        {
          id: "food-la-lepre-b",
          name: "La Lepre",
          style: "Lakefront dinner · elegant plates",
          when: "dinner",
          mapsUrl: maps("La Lepre Desenzano del Garda"),
          locationId: "loc-desenzano-evening-b",
        },
      ],
    },
  ],
};

const DAY_3: DayGuide = {
  dayNumber: 3,
  bannerNote:
    "Mincio valley loop from Desenzano: Castellaro ~35 min → Borghetto ~10 min → Sigurtà ~20 min → home ~35 min. Leave by 09:00.",
  locations: [
    {
      id: "loc-castellaro",
      name: "Castellaro Lagusello",
      mapsUrl: maps("Castellaro Lagusello"),
      mustSee: [
        {
          id: "castellaro-hamlet",
          title: "Medieval hamlet",
          detail: "Listed among Italy's most beautiful villages — ~35 min from Desenzano",
        },
        {
          id: "castellaro-lake",
          title: "Castellaro Small Lake",
          detail: "Small lake loop walk (~20 min)",
        },
        {
          id: "castellaro-castle",
          title: "Castle mound / walls",
          detail: "Quick photo stop",
        },
      ],
    },
    {
      id: "loc-borghetto",
      name: "Borghetto sul Mincio",
      mapsUrl: maps("Borghetto sul Mincio"),
      websiteUrl: "https://www.borghettosulmincio.it/",
      mustSee: [
        {
          id: "borghetto-mills",
          title: "Watermills on the Mincio",
          detail: "Postcard village",
        },
        {
          id: "borghetto-bridge",
          title: "Visconti Bridge (Ponte Visconteo)",
          detail: "Medieval bridge — walk or view from village",
        },
        {
          id: "borghetto-walk",
          title: "Riverside walk",
          detail: "Flat, ~1 hr",
        },
      ],
    },
    {
      id: "loc-sigurta",
      name: "Parco Giardino Sigurtà",
      mapsUrl: maps("Parco Giardino Sigurtà"),
      websiteUrl: "https://www.sigurta.it/en/",
      mustSee: [
        {
          id: "sigurta-lawn",
          title: "Great Lawn (Prato Grande)",
          detail: "Iconic tree-lined vista",
        },
        {
          id: "sigurta-hermitage",
          title: "Hermitage & waterfalls",
          detail: "Shaded paths",
        },
        {
          id: "sigurta-maze",
          title: "Maze & seasonal flowers",
          detail: "Easy walking, heat-friendly",
        },
      ],
    },
  ],
  food: [
    {
      id: "food-taverna-silenzio",
      name: "Taverna del Silenzio",
      style: "Valeggio-style tortellini · book ahead",
      when: "lunch",
      mapsUrl: maps("Taverna del Silenzio Borghetto"),
      isPrimary: true,
    },
    {
      id: "food-antico-borgo",
      name: "Antico Borgo",
      style: "Pizza, grill · backup",
      when: "lunch",
      mapsUrl: maps("Antico Borgo Borghetto sul Mincio"),
    },
  ],
};

const DAY_4: DayGuide = {
  dayNumber: 4,
  bannerNote:
    "Manerba boat + Rocca day — ~40 min drive each way from Villa Bella, Desenzano. Optional hikes: Tibetan Bridge (east shore, ~50 min) or full-day Paganella ridge (Molveno, ~2 hr). Book marina slot for 09:30.",
  locations: [
    {
      id: "loc-manerba-marina",
      name: "Manerba marina",
      mapsUrl: maps("Manerba del Garda marina boat rental"),
      mustSee: [
        {
          id: "manerba-boat",
          title: "Self-drive family boat",
          detail: "2 hr on the lake — book marina slot (~40 min from Desenzano)",
        },
      ],
    },
    {
      id: "loc-rocca-manerba",
      name: "Manerba Rocca",
      mapsUrl: maps("Rocca di Manerba"),
      websiteUrl: "https://www.visitgarda.com/en/place/rocca-di-manerba/",
      mustSee: [
        {
          id: "rocca-trails",
          title: "Clifftop trails",
          detail: "Archaeological park, panoramic benches",
        },
        {
          id: "rocca-views",
          title: "Lake panoramas",
          detail: "1.5–2 hr walk after the boat",
        },
      ],
    },
    {
      id: "loc-manerba-village",
      name: "Manerba village",
      mapsUrl: maps("Manerba del Garda"),
      optional: true,
      mustSee: [
        {
          id: "manerba-harbor",
          title: "Harbor stroll",
          detail: "Optional ice cream if time after lunch",
          optional: true,
        },
      ],
    },
    {
      id: "loc-lonato-rocca",
      name: "Rocca di Lonato",
      mapsUrl: maps("Rocca di Lonato"),
      optional: true,
      mustSee: [
        {
          id: "lonato-rocca",
          title: "Hilltop fortress & lake views",
          detail: "Optional spare-evening stop — only ~15 min from Desenzano",
          optional: true,
        },
      ],
    },
    {
      id: "loc-tibetan-bridge",
      name: "Tibetan Bridge — Crero (Torri del Benaco)",
      mapsUrl: maps("Ponte Tibetano Crero Torri del Benaco"),
      websiteUrl: "https://www.gardaclick.com/en/to-do/tibetan-bridge-crero",
      optional: true,
      mustSee: [
        {
          id: "tibetan-bridge",
          title: "Ponte Tibetano (suspension bridge)",
          detail:
            "35 m steel bridge ~42 m above Val Vanzana — links CAI paths 38/39. Easy–moderate loop ~1.5–2 hr from Crero or Pai di Sopra",
          optional: true,
        },
        {
          id: "tibetan-crero-pai",
          title: "Crero & Pai di Sopra villages",
          detail: "Medieval hamlets with lake views — picnic clearing midway",
          optional: true,
        },
        {
          id: "tibetan-torri",
          title: "Torri del Benaco lakeside",
          detail: "Optional stop at the port & Scaliger castle before/after the gorge walk",
          optional: true,
        },
      ],
    },
    {
      id: "loc-paganella-traverse",
      name: "Paganella ridge — Canfedin & Monte Gazza",
      mapsUrl: maps("Cima Paganella sentiero 602 Andalo"),
      websiteUrl:
        "https://www.lagoparkmolveno.it/traversata-paganella-canfedin-monte-gazza.html",
      optional: true,
      mustSee: [
        {
          id: "paganella-lift",
          title: "Cable car Andalo → Cima Paganella",
          detail: "Start at m.2125 Bar Rifugio La Roda — bus Molveno↔Andalo",
          optional: true,
        },
        {
          id: "paganella-602",
          title: "Sentiero 602 — Cima Canfedin & Passo San Giacomo",
          detail: "Ridge walk with Brenta Dolomites & Lake Garda views — ~1.5 hr from La Roda",
          optional: true,
        },
        {
          id: "paganella-gazza",
          title: "Monte Gazza & Malga di Covelo",
          detail: "Medium effort traverse — 5–5.5 hr total; optional cabinovia return instead of descent to Molveno",
          optional: true,
        },
      ],
    },
  ],
  food: [
    {
      id: "food-lido-azzurro",
      name: "Ristorante Pizzeria Lido Azzurro",
      style: "Pizza, lake fish · waterfront",
      when: "lunch",
      mapsUrl: maps("Lido Azzurro Manerba"),
      isPrimary: true,
    },
    {
      id: "food-dalla-chiesa",
      name: "Trattoria Dalla Chiesa",
      style: "Grill, pasta · inland",
      when: "lunch",
      mapsUrl: maps("Trattoria Dalla Chiesa Manerba"),
    },
  ],
};

const DAY_5: DayGuide = {
  dayNumber: 5,
  bannerNote:
    "Gardaland weekday — only ~20 min from Desenzano. Park opens 10:00; leave base ~09:45.",
  locations: [
    {
      id: "loc-gardaland",
      name: "Gardaland",
      mapsUrl: maps("Gardaland"),
      websiteUrl: "https://www.gardaland.it/en/",
      mustSee: [
        {
          id: "gardaland-coasters",
          title: "Roller coasters",
          detail: "Adrenaline, Raptor, Oblivion — check height limits",
        },
        {
          id: "gardaland-water",
          title: "Water rides",
          detail: "Cooling on hot days",
        },
        {
          id: "gardaland-sealife",
          title: "SEA LIFE aquarium",
          detail: "Inside the resort",
        },
        {
          id: "gardaland-shows",
          title: "Shows & themed areas",
          detail: "Stunt and family rides",
        },
      ],
    },
  ],
  food: [
    {
      id: "food-gardaland-park",
      name: "In-park food courts",
      style: "Burgers, pizza, fries · casual",
      when: "lunch",
      mapsUrl: maps("Gardaland restaurant"),
      isPrimary: true,
    },
  ],
};

const DAY_6: DayGuide = {
  dayNumber: 6,
  bannerNote:
    "Group vote from Desenzano: Verona (~40 min) OR Monte Baldo + Malcesine (~1 hr) — pick one only.",
  options: [
    {
      id: "option-a-verona",
      label: "Option A: Verona",
      locations: [
        {
          id: "loc-verona",
          name: "Verona",
          mapsUrl: maps("Verona Arena"),
          websiteUrl: "https://www.arena.it/en/",
          mustSee: [
            {
              id: "verona-arena",
              title: "Verona Arena",
              detail: "1st-century Roman amphitheater",
            },
            {
              id: "verona-erbe",
              title: "Herbs Square (Piazza delle Erbe)",
              detail: "Market square, frescoed buildings",
            },
            {
              id: "verona-lamberti",
              title: "Lamberti Tower",
              detail: "City views — optional climb",
            },
            {
              id: "verona-juliet",
              title: "Juliet's House",
              detail: "10-min photo stop — skip long queues",
            },
            {
              id: "verona-ponte",
              title: "Stone Bridge (Ponte Pietra)",
              detail: "Roman bridge over the Adige",
            },
            {
              id: "verona-mazzini",
              title: "Via Mazzini",
              detail: "Shopping street",
            },
          ],
        },
      ],
      food: [
        {
          id: "food-al-pompiere",
          name: "Trattoria Al Pompiere",
          style: "Grill chicken, pasta · casual",
          when: "lunch",
          mapsUrl: maps("Trattoria Al Pompiere Verona"),
          isPrimary: true,
          locationId: "loc-verona",
        },
        {
          id: "food-dante",
          name: "Osteria da Dante",
          style: "Pizza, Verona staples",
          when: "lunch",
          mapsUrl: maps("Osteria da Dante Verona"),
          locationId: "loc-verona",
        },
        {
          id: "food-du-de-cope",
          name: "Pizzeria Du de Cope",
          style: "Pizza · teen-friendly",
          when: "lunch",
          mapsUrl: maps("Pizzeria Du de Cope Verona"),
          locationId: "loc-verona",
        },
      ],
    },
    {
      id: "option-b-baldo",
      label: "Option B: Monte Baldo + Malcesine",
      locations: [
        {
          id: "loc-malcesine",
          name: "Malcesine",
          mapsUrl: maps("Malcesine Lake Garda"),
          mustSee: [
            {
              id: "malcesine-porticciolo",
              title: "Porticciolo di Malcesine",
              detail: "Main port — postcard lake views as the boat would arrive",
            },
            {
              id: "malcesine-harbor",
              title: "Old harbor lanes",
              detail: "Narrow streets, gelato, crystal-clear water",
            },
            {
              id: "malcesine-castle",
              title: "Scaliger Castle (Castello Scaligero)",
              detail: "Lake views from the tower — entry ~€7",
            },
            {
              id: "malcesine-panorama",
              title: "Punto Panoramico Malcesine",
              detail: "Free viewpoint over the lake — quick photo stop",
            },
            {
              id: "malcesine-palazzo",
              title: "Palazzo dei Capitani",
              detail: "Lakeside courtyard — cinematic Italian waterfront",
            },
          ],
        },
        {
          id: "loc-monte-baldo",
          name: "Monte Baldo",
          mapsUrl: maps("Monte Baldo cable car Malcesine"),
          websiteUrl: "https://www.funiviedelbaldo.it/en/",
          mustSee: [
            {
              id: "baldo-cable",
              title: "Rotating cable car",
              detail: "Summit panorama over Lake Garda",
            },
            {
              id: "baldo-walk",
              title: "Summit panorama walk",
              detail: "Easy paths 1.5–2 hr — no long trek",
            },
          ],
        },
        {
          id: "loc-limone-optional",
          name: "Limone sul Garda",
          mapsUrl: maps("Limone sul Garda Porto Vecchio"),
          optional: true,
          mustSee: [
            {
              id: "limone-limonaia",
              title: "Limonaia del Castel",
              detail: "Historic lemon greenhouse with panoramic lake views",
            },
            {
              id: "limone-cycle",
              title: "Cliffside cycle path",
              detail: "Walkable lakeside tunnels — no bike needed",
              optional: true,
            },
            {
              id: "limone-harbor",
              title: "Porto Vecchio",
              detail: "Lemon sorbet in a frozen lemon shell",
            },
          ],
        },
      ],
      food: [
        {
          id: "food-vecchia-malcesine",
          name: "Ristorante Vecchia Malcesine",
          style: "Pizza, lake fish · casual",
          when: "lunch",
          mapsUrl: maps("Ristorante Vecchia Malcesine"),
          isPrimary: true,
          locationId: "loc-malcesine",
        },
        {
          id: "food-bar-derby",
          name: "Bar Derby",
          style: "Sandwiches, pizza · very casual",
          when: "lunch",
          mapsUrl: maps("Bar Derby Malcesine"),
          locationId: "loc-malcesine",
        },
        {
          id: "food-rifugio-altissimo",
          name: "Rifugio Altissimo",
          style: "Mountain lodge plates",
          when: "lunch",
          mapsUrl: maps("Rifugio Altissimo Monte Baldo"),
          locationId: "loc-monte-baldo",
        },
        {
          id: "food-bar-oasi",
          name: "Bar Oasi",
          style: "Spritz with lake view",
          when: "snack",
          mapsUrl: maps("Bar Oasi Malcesine"),
          locationId: "loc-malcesine",
        },
        {
          id: "food-focacceria-piasarot",
          name: "Focacceria Dal Piasarot",
          style: "Focaccia sandwiches · Limone add-on",
          when: "lunch",
          mapsUrl: maps("Focacceria Dal Piasarot Limone sul Garda"),
          locationId: "loc-limone-optional",
        },
      ],
    },
  ],
};

const DAY_7: DayGuide = {
  dayNumber: 7,
  bannerNote:
    "South-shore day from Desenzano: Option A CanevaWorld + Peschiera OR Option B Lazise–Bardolino–Garda villages (~25 min each). Navigarda ferry links south towns in summer.",
  options: [
    {
      id: "option-a-caneva",
      label: "Option A: CanevaWorld & Peschiera",
      locations: [
        {
          id: "loc-lazise-centro-a",
          name: "Lazise historic centre",
          mapsUrl: maps("Lazise del Garda centro storico"),
          optional: true,
          mustSee: [
            {
              id: "lazise-oldtown-a",
              title: "Medieval lanes & lakeside walk",
              detail: "Optional 30 min before the park — same resort area as CanevaWorld",
            },
            {
              id: "lazise-castle-a",
              title: "Scaliger castle & medieval walls",
              detail: "City gates and harbour — compact centro storico",
            },
            {
              id: "lazise-market-a",
              title: "Wednesday market",
              detail: "Ceramics and local goods — go early for fewer crowds",
              optional: true,
            },
          ],
        },
        {
          id: "loc-canevaworld",
          name: "CanevaWorld Aqua Paradise",
          mapsUrl: maps("CanevaWorld Aqua Paradise"),
          websiteUrl: "https://www.canevaworld.it/en/aqua-paradise/",
          mustSee: [
            {
              id: "caneva-slides",
              title: "Extreme slides",
              detail: "Main teen draw",
            },
            {
              id: "caneva-wave",
              title: "Wave pools & lazy river",
              detail: "Heat-wave friendly",
            },
            {
              id: "caneva-pools",
              title: "Adventure pools",
              detail: "Allow at least a half day",
            },
          ],
        },
        {
          id: "loc-peschiera",
          name: "Peschiera del Garda",
          mapsUrl: maps("Peschiera del Garda fortress"),
          mustSee: [
            {
              id: "peschiera-walls",
              title: "Fortress walls (UNESCO)",
              detail: "Walk the ramparts",
            },
            {
              id: "peschiera-canals",
              title: "Canals & harbor",
              detail: "Little Venice feel — ~45 min after park",
            },
            {
              id: "peschiera-porta",
              title: "Porta Verona / bastion views",
              detail: "Quick circuit",
            },
            {
              id: "peschiera-navigarda",
              title: "Navigarda ferry pier",
              detail: "Optional hop-on lake ferry to Sirmione or Desenzano — buy tickets at the port in summer",
              optional: true,
            },
            {
              id: "peschiera-stilt",
              title: "UNESCO prehistoric stilt houses",
              detail: "Pile-dwelling heritage site — quick interpretive stop near the fortress",
              optional: true,
            },
            {
              id: "peschiera-bike",
              title: "Mincio bike path toward Mantova",
              detail: "Flat riverside ride — rent bikes in town if teens want activity",
              optional: true,
            },
          ],
        },
        {
          id: "loc-ottella",
          name: "Ottella Winery",
          mapsUrl: maps("Ottella Winery Peschiera"),
          optional: true,
          mustSee: [
            {
              id: "ottella-tasting",
              title: "Indoor wine tasting",
              detail: "Lugana whites — ideal rainy-day stop ~10 min from Peschiera",
            },
          ],
        },
        {
          id: "loc-isola-garda-a",
          name: "Isola del Garda",
          mapsUrl: maps("Isola del Garda boat tour"),
          optional: true,
          mustSee: [
            {
              id: "isola-tour-a",
              title: "Island villa boat tour",
              detail: "Private island visits May–Oct — book ahead from nearby ports",
              optional: true,
            },
          ],
        },
      ],
      food: [
        {
          id: "food-caneva-cafe",
          name: "CanevaWorld park cafés",
          style: "Burgers, sandwiches · casual",
          when: "lunch",
          mapsUrl: maps("CanevaWorld restaurant"),
          isPrimary: true,
          locationId: "loc-canevaworld",
        },
        {
          id: "food-san-marco-lazise",
          name: "Pizzeria Ristorante San Marco",
          style: "Pizza, pasta · Lazise",
          when: "lunch",
          mapsUrl: maps("Pizzeria San Marco Lazise"),
          locationId: "loc-lazise-centro-a",
        },
        {
          id: "food-antica-osteria-peschiera",
          name: "Antica Osteria",
          style: "Pasta · Peschiera centro",
          when: "lunch",
          mapsUrl: maps("Antica Osteria Peschiera del Garda"),
          locationId: "loc-peschiera",
        },
        {
          id: "food-cristallo-lazise-a",
          name: "Caffè Gelateria Cristallo",
          style: "Aperitivo on the square · Lazise",
          when: "snack",
          mapsUrl: maps("Caffè Gelateria Cristallo Lazise"),
          locationId: "loc-lazise-centro-a",
        },
        {
          id: "food-peschiera-snack",
          name: "Ice cream in Peschiera",
          style: "Canal-side snack ~16:00",
          when: "snack",
          mapsUrl: maps("Peschiera del Garda centro"),
          locationId: "loc-peschiera",
        },
      ],
    },
    {
      id: "option-b-villages",
      label: "Option B: Lazise, Bardolino & Garda villages",
      locations: [
        {
          id: "loc-lazise-centro-b",
          name: "Lazise historic centre",
          mapsUrl: maps("Lazise del Garda centro storico"),
          mustSee: [
            {
              id: "lazise-scaligero-b",
              title: "Scaliger walls & harbour",
              detail: "Compact old town — lakeside stroll ~45 min",
            },
            {
              id: "lazise-marina-b",
              title: "Porto di Lazise",
              detail: "Colourful boats and waterfront cafés",
            },
            {
              id: "lazise-marconi-b",
              title: "Lungolago Marconi sunrise walk",
              detail: "Calm harbour views — best early before the villages fill up",
              optional: true,
            },
            {
              id: "lazise-market-b",
              title: "Wednesday market",
              detail: "Ceramics and local goods — go early",
              optional: true,
            },
          ],
        },
        {
          id: "loc-bardolino",
          name: "Bardolino",
          mapsUrl: maps("Bardolino Lake Garda"),
          mustSee: [
            {
              id: "bardolino-promenade",
              title: "Lakeside promenade",
              detail: "Wine town waterfront — gelato and harbour views (~45 min)",
            },
            {
              id: "bardolino-walk-garda",
              title: "Lakeside walk to Garda",
              detail: "Flat waterfront path — one of the lake's best strolls (~30 min each way)",
            },
            {
              id: "bardolino-church",
              title: "San Severo church & old lanes",
              detail: "Short wander through the centro storico",
            },
            {
              id: "bardolino-winery",
              title: "Bardolino wine tasting",
              detail: "Local wineries with cheese boards — book or walk in",
              optional: true,
            },
            {
              id: "bardolino-olive-oil",
              title: "Olive Oil Museum (Cisano)",
              detail: "Short drive from Bardolino — ~20 min visit",
              optional: true,
            },
          ],
        },
        {
          id: "loc-garda-village",
          name: "Garda",
          mapsUrl: maps("Garda Lake Garda town"),
          mustSee: [
            {
              id: "garda-harbor",
              title: "Garda harbour & lungolago",
              detail: "Colourful waterfront hotels — classic south-lake lunch spot",
            },
            {
              id: "garda-punta-vigilio",
              title: "Punta San Vigilio",
              detail: "Scenic peninsula viewpoint — short walk or taxi from harbour",
              optional: true,
            },
            {
              id: "garda-oldtown",
              title: "Historic centre",
              detail: "Cobbled lanes and lake views before driving home",
            },
          ],
        },
        {
          id: "loc-tibetan-bridge-b",
          name: "Tibetan Bridge — Crero (Torri del Benaco)",
          mapsUrl: maps("Ponte Tibetano Crero Torri del Benaco"),
          websiteUrl: "https://www.gardaclick.com/en/to-do/tibetan-bridge-crero",
          optional: true,
          mustSee: [
            {
              id: "tibetan-bridge-b",
              title: "Ponte Tibetano gorge loop",
              detail:
                "Add-on from east shore — ~50 min from Desenzano, 1.5–2 hr hike with suspension bridge & lake views",
              optional: true,
            },
          ],
        },
      ],
      food: [
        {
          id: "food-lazise-lunch-b",
          name: "Pizzeria Ristorante San Marco",
          style: "Pizza, pasta · Lazise",
          when: "lunch",
          mapsUrl: maps("Pizzeria San Marco Lazise"),
          isPrimary: true,
          locationId: "loc-lazise-centro-b",
        },
        {
          id: "food-classique-lazise",
          name: "Classique",
          style: "Restaurant & hotel · Lazise square",
          when: "lunch",
          mapsUrl: maps("Classique Lazise del Garda"),
          locationId: "loc-lazise-centro-b",
        },
        {
          id: "food-loggia-rambaldi",
          name: "La Loggia Rambaldi",
          style: "Terrace lunch · Bardolino",
          when: "lunch",
          mapsUrl: maps("La Loggia Rambaldi Bardolino"),
          locationId: "loc-bardolino",
        },
        {
          id: "food-cristallo-lazise-b",
          name: "Caffè Gelateria Cristallo",
          style: "Aperitivo on the square · Lazise",
          when: "snack",
          mapsUrl: maps("Caffè Gelateria Cristallo Lazise"),
          locationId: "loc-lazise-centro-b",
        },
        {
          id: "food-bardolino-gelato",
          name: "Gelato on Bardolino promenade",
          style: "Casual lakeside snack",
          when: "snack",
          mapsUrl: maps("gelato Bardolino lungolago"),
          locationId: "loc-bardolino",
        },
        {
          id: "food-garda-cafe",
          name: "Waterfront cafés in Garda",
          style: "Coffee, panini · casual",
          when: "snack",
          mapsUrl: maps("caffè Garda lungolago"),
          locationId: "loc-garda-village",
        },
      ],
    },
  ],
};

const DAY_8: DayGuide = {
  dayNumber: 8,
  bannerNote:
    "Sirmione castle + Aquaria spa — ~15 min from Desenzano. Spa group booking confirmed ✅.",
  locations: [
    {
      id: "loc-sirmione",
      name: "Sirmione",
      mapsUrl: maps("Scaligero Castle Sirmione"),
      websiteUrl: "https://www.visitgarda.com/en/place/scaliger-castle/",
      mustSee: [
        {
          id: "sirmione-bridge",
          title: "Ponte Levatoio (flower-box bridge)",
          detail: "Iconic entrance bridge into the peninsula — quick photo",
        },
        {
          id: "sirmione-piazza",
          title: "Piazza Giosuè Carducci",
          detail: "Colourful square — people-watching and drinks",
        },
        {
          id: "sirmione-castle",
          title: "Scaliger Castle",
          detail: "Peninsula fortress — short visit ~45 min",
        },
        {
          id: "sirmione-oldtown",
          title: "Old town lanes",
          detail: "Ice cream + stroll to the tip — check gelato reviews/prices",
        },
        {
          id: "sirmione-grotte",
          title: "Catullus Caves (Grotte di Catullo)",
          detail: "Roman villa ruins & lake views — only if castle stays short",
          optional: true,
          link: "https://www.grottedicatullo.it/en/",
          linkLabel: "Official site",
        },
        {
          id: "sirmione-beaches",
          title: "Jamaica Beach & Lido delle Bionde",
          detail: "Sunset stroll or swim — Lido Galeazzi has loungers and kayaks",
          optional: true,
        },
      ],
    },
    {
      id: "loc-aquaria",
      name: "Aquaria Thermal Spa",
      mapsUrl: maps("Aquaria Thermal Spa Sirmione"),
      websiteUrl: "https://www.aquaria.it/en/",
      mustSee: [
        {
          id: "aquaria-pools",
          title: "Thermal pools",
          detail: "Indoor/outdoor, lake-edge — group booking confirmed ✅",
        },
        {
          id: "aquaria-wellness",
          title: "Saunas & wellness",
          detail: "Pre-booked afternoon slot",
        },
      ],
    },
  ],
  food: [
    {
      id: "food-gelateria-scaligeri",
      name: "Gelateria Scaligeri",
      style: "Gelato · pistachio or stracciatella",
      when: "snack",
      mapsUrl: maps("Gelateria Scaligeri Sirmione"),
    },
    {
      id: "food-caffe-grande-italia",
      name: "Caffè Grande Italia",
      style: "Drinks & light lunch · Piazza Carducci",
      when: "snack",
      mapsUrl: maps("Caffè Grande Italia Sirmione"),
    },
    {
      id: "food-la-roccia",
      name: "La Roccia",
      style: "Pizza, lake fish · waterfront",
      when: "lunch",
      mapsUrl: maps("La Roccia Sirmione"),
      isPrimary: true,
    },
    {
      id: "food-san-lorenzo",
      name: "Trattoria San Lorenzo",
      style: "Pizza, pasta · old town",
      when: "lunch",
      mapsUrl: maps("Trattoria San Lorenzo Sirmione"),
    },
    {
      id: "food-locanda-bersagliere",
      name: "Locanda al Bersagliere",
      style: "Near castle · lake views",
      when: "lunch",
      mapsUrl: maps("Locanda al Bersagliere Sirmione"),
    },
  ],
};

const DAY_9: DayGuide = {
  dayNumber: 9,
  bannerNote:
    "Check out Villa Bella, Desenzano before 10:00, then Serravalle ~1 hr 45 min → Milan ~1 hr 15 min. ZTL €7.50 if entering before 19:30.",
  locations: [
    {
      id: "loc-serravalle",
      name: "Serravalle Designer Outlet",
      mapsUrl: maps("Serravalle Designer Outlet"),
      websiteUrl: "https://www.mcarthurglen.com/en/outlets/it/designer-outlet-serravalle/",
      mustSee: [
        {
          id: "serravalle-shopping",
          title: "Outlet shopping",
          detail: "~3 hr — Nike, Adidas, major brands",
        },
      ],
    },
    {
      id: "loc-milan-eve",
      name: "Milan (evening)",
      mapsUrl: maps("Navigli Milan"),
      mustSee: [
        {
          id: "milan-navigli",
          title: "Navigli canals",
          detail: "Short evening walk after car return if time",
        },
      ],
    },
  ],
  food: [
    {
      id: "food-outlet-court",
      name: "Outlet food court",
      style: "Burgers, pizza · casual",
      when: "lunch",
      mapsUrl: maps("Serravalle Outlet food"),
      isPrimary: true,
    },
    {
      id: "food-spontini",
      name: "Spontini",
      style: "Thick-crust pizza · Milan",
      when: "dinner",
      mapsUrl: maps("Spontini Milan"),
      isPrimary: true,
    },
    {
      id: "food-nuovo-macello",
      name: "Trattoria del Nuovo Macello",
      style: "Steak, grill · farewell dinner alt",
      when: "dinner",
      mapsUrl: maps("Trattoria del Nuovo Macello Milan"),
    },
  ],
};

export const TRIP_DAY_GUIDES: Readonly<Partial<Record<number, DayGuide>>> = {
  2: DAY_2,
  3: DAY_3,
  4: DAY_4,
  5: DAY_5,
  6: DAY_6,
  7: DAY_7,
  8: DAY_8,
  9: DAY_9,
};

export function getDayGuide(dayNumber: number): DayGuide | undefined {
  return TRIP_DAY_GUIDES[dayNumber];
}

/** Collect all food entries for a guide (flat or per-option). */
export function getDayGuideFood(guide: DayGuide): DayGuideFood[] {
  if (guide.options?.length) {
    return guide.options.flatMap((o) => o.food);
  }
  return guide.food ?? [];
}

/** Collect all locations for a guide (flat or per-option). */
export function getDayGuideLocations(guide: DayGuide): DayGuideLocation[] {
  if (guide.options?.length) {
    return guide.options.flatMap((o) => o.locations);
  }
  return guide.locations ?? [];
}

/** Collect all URLs from a day guide for validation. */
export function collectDayGuideUrls(guide: DayGuide): string[] {
  const urls: string[] = [];
  const add = (u?: string) => {
    if (u) urls.push(u);
  };

  for (const loc of getDayGuideLocations(guide)) {
    add(loc.mapsUrl);
    add(loc.websiteUrl);
    for (const spot of loc.mustSee) {
      add(spot.link);
    }
  }
  for (const f of getDayGuideFood(guide)) {
    add(f.mapsUrl);
    add(f.websiteUrl);
  }
  return urls;
}
