import type { DayGuide, DayGuideFood, DayGuideLocation } from "@/types";

/** Google Maps search URL for a place query */
function maps(q: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

const DAY_2: DayGuide = {
  dayNumber: 2,
  locations: [
    {
      id: "loc-bergamo-alta",
      name: "Bergamo Città Alta",
      mapsUrl: maps("Bergamo Città Alta"),
      websiteUrl: "https://www.visitbergamo.net/en/",
      mustSee: [
        {
          id: "bergamo-piazza-vecchia",
          title: "Piazza Vecchia",
          detail: "One of the prettiest squares in northern Italy",
        },
        {
          id: "bergamo-basilica",
          title: "Basilica di Santa Maria Maggiore",
          detail: "Richly decorated interior",
        },
        {
          id: "bergamo-walls",
          title: "Venetian Walls (UNESCO)",
          detail: "Walk along them for valley views",
        },
        {
          id: "bergamo-campanone",
          title: "Campanone (Torre Civica)",
          detail: "Climb for a panorama over the Alps and plains",
        },
        {
          id: "bergamo-funicular",
          title: "Funicular ride",
          detail: "Città Bassa ↔ Città Alta — part of the experience",
        },
      ],
    },
    {
      id: "loc-monzambano-eve",
      name: "Monzambano (evening)",
      mapsUrl: maps("Monzambano Lake Garda"),
      mustSee: [
        {
          id: "monzambano-castle",
          title: "Castello di Monzambano",
          detail: "Ruins + lake views — short stroll",
        },
        {
          id: "monzambano-shore",
          title: "Lake shore",
          detail: "Swim or sunset after check-in",
        },
      ],
    },
  ],
  food: [
    {
      id: "food-la-bruschetta",
      name: "La Bruschetta",
      style: "Pizza, pasta, bruschette · casual",
      when: "lunch",
      mapsUrl: maps("La Bruschetta Bergamo Alta"),
      isPrimary: true,
    },
    {
      id: "food-sant-angelo",
      name: "Pizzeria Sant'Angelo",
      style: "Pizza by the slice · casual",
      when: "lunch",
      mapsUrl: maps("Pizzeria Sant Angelo Bergamo"),
    },
    {
      id: "food-trattoria-ponte",
      name: "Trattoria del Ponte",
      style: "Lake fish, local pasta",
      when: "dinner",
      mapsUrl: maps("Trattoria del Ponte Monzambano"),
      isPrimary: true,
    },
    {
      id: "food-osteria-moro",
      name: "Osteria del Moro",
      style: "Village trattoria",
      when: "dinner",
      mapsUrl: maps("Osteria del Moro Monzambano"),
    },
  ],
};

const DAY_3: DayGuide = {
  dayNumber: 3,
  locations: [
    {
      id: "loc-castellaro",
      name: "Castellaro Lagusello",
      mapsUrl: maps("Castellaro Lagusello"),
      mustSee: [
        {
          id: "castellaro-hamlet",
          title: "Medieval hamlet",
          detail: "One of Italy's borghi più belli",
        },
        {
          id: "castellaro-lake",
          title: "Laghetto di Castellaro",
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
          title: "Ponte Visconteo",
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
      style: "Tortellini di Valeggio · book ahead",
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
  bannerNote: "Group vote: pick Verona OR Monte Baldo — do not try both in one day.",
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
              title: "Piazza delle Erbe",
              detail: "Market square, frescoed buildings",
            },
            {
              id: "verona-lamberti",
              title: "Torre dei Lamberti",
              detail: "City views — optional climb",
            },
            {
              id: "verona-juliet",
              title: "Juliet's House",
              detail: "10-min photo stop — skip long queues",
            },
            {
              id: "verona-ponte",
              title: "Ponte Pietra",
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
        },
        {
          id: "food-dante",
          name: "Osteria da Dante",
          style: "Pizza, Verona staples",
          when: "lunch",
          mapsUrl: maps("Osteria da Dante Verona"),
        },
        {
          id: "food-du-de-cope",
          name: "Pizzeria Du de Cope",
          style: "Pizza · teen-friendly",
          when: "lunch",
          mapsUrl: maps("Pizzeria Du de Cope Verona"),
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
              id: "malcesine-harbor",
              title: "Old harbor",
              detail: "Narrow lanes and gelato",
            },
            {
              id: "malcesine-castle",
              title: "Scaliger Castle",
              detail: "Lake views from the tower",
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
      ],
      food: [
        {
          id: "food-vecchia-malcesine",
          name: "Ristorante Vecchia Malcesine",
          style: "Pizza, lake fish · casual",
          when: "lunch",
          mapsUrl: maps("Ristorante Vecchia Malcesine"),
          isPrimary: true,
        },
        {
          id: "food-bar-derby",
          name: "Bar Derby",
          style: "Panini, pizza · very casual",
          when: "lunch",
          mapsUrl: maps("Bar Derby Malcesine"),
        },
        {
          id: "food-rifugio-altissimo",
          name: "Rifugio Altissimo",
          style: "Simple mountain plates",
          when: "lunch",
          mapsUrl: maps("Rifugio Altissimo Monte Baldo"),
        },
      ],
    },
  ],
};

const DAY_5: DayGuide = {
  dayNumber: 5,
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
  locations: [
    {
      id: "loc-sirmione",
      name: "Sirmione",
      mapsUrl: maps("Scaligero Castle Sirmione"),
      websiteUrl: "https://www.visitgarda.com/en/place/scaliger-castle/",
      mustSee: [
        {
          id: "sirmione-castle",
          title: "Scaligero Castle",
          detail: "Peninsula fortress — short visit ~45 min",
        },
        {
          id: "sirmione-oldtown",
          title: "Old town lanes",
          detail: "Gelato + stroll to the tip",
        },
        {
          id: "sirmione-grotte",
          title: "Grotte di Catullo",
          detail: "Roman villa ruins & lake views — only if castle stays short",
          optional: true,
          link: "https://www.grottedicatullo.it/en/",
          linkLabel: "Official site",
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
          detail: "Indoor/outdoor, lake-edge — group booking confirmed",
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
      id: "food-locanda-bersagliere",
      name: "Locanda al Bersagliere",
      style: "Near castle · lake views",
      when: "lunch",
      mapsUrl: maps("Locanda al Bersagliere Sirmione"),
      isPrimary: true,
    },
    {
      id: "food-la-roccia",
      name: "La Roccia",
      style: "Pizza, lake fish · waterfront",
      when: "lunch",
      mapsUrl: maps("La Roccia Sirmione"),
    },
    {
      id: "food-san-lorenzo",
      name: "Trattoria San Lorenzo",
      style: "Pizza, pasta · old town",
      when: "lunch",
      mapsUrl: maps("Trattoria San Lorenzo Sirmione"),
    },
  ],
};

const DAY_7: DayGuide = {
  dayNumber: 7,
  locations: [
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
      ],
    },
  ],
  food: [
    {
      id: "food-caneva-cafe",
      name: "CanevaWorld park cafés",
      style: "Burgers, panini · casual",
      when: "lunch",
      mapsUrl: maps("CanevaWorld restaurant"),
      isPrimary: true,
    },
    {
      id: "food-san-marco-lazise",
      name: "Pizzeria Ristorante San Marco",
      style: "Pizza, pasta · Lazise",
      when: "lunch",
      mapsUrl: maps("Pizzeria San Marco Lazise"),
    },
    {
      id: "food-peschiera-snack",
      name: "Gelato in Peschiera",
      style: "Canal-side snack ~16:00",
      when: "snack",
      mapsUrl: maps("Peschiera del Garda centro"),
    },
  ],
};

const DAY_8: DayGuide = {
  dayNumber: 8,
  locations: [
    {
      id: "loc-manerba-marina",
      name: "Manerba marina",
      mapsUrl: maps("Manerba del Garda marina boat rental"),
      mustSee: [
        {
          id: "manerba-boat",
          title: "Self-drive family boat",
          detail: "2 hr on the lake — book marina slot",
        },
      ],
    },
    {
      id: "loc-rocca-manerba",
      name: "Rocca di Manerba",
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
          detail: "1.5–2 hr walk after lunch",
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
          detail: "Optional gelato if time after Rocca",
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

const DAY_9: DayGuide = {
  dayNumber: 9,
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
