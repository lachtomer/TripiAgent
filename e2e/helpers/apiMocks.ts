import type { Page } from "@playwright/test";

export const MOCK_NEARBY_TOP_PICKS = [
  {
    place_id: "place1",
    name: "Colosseum",
    rating: 4.9,
    distance: 800,
    open_now: true,
    maps_url: "https://www.google.com/maps/search/?api=1&query_place_id=place1",
  },
  {
    place_id: "place2",
    name: "Pantheon",
    rating: 4.8,
    distance: 1200,
    open_now: true,
    maps_url: "https://www.google.com/maps/search/?api=1&query_place_id=place2",
  },
  {
    place_id: "place3",
    name: "Trastevere",
    rating: 4.7,
    distance: 2500,
    open_now: true,
    maps_url: "https://www.google.com/maps/search/?api=1&query_place_id=place3",
  },
];

export async function mockNearbyTopPicks(page: Page) {
  await page.route("**/api/places**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_NEARBY_TOP_PICKS),
    });
  });
}

const MILAN_PIZZA_PLACE = {
  place_id: "mock-milan-pizza-1",
  name: "Pizzeria Milano Centro",
  rating: 4.5,
  address: "Via Roma 1, Milan, Italy",
  formatted_address: "Via Roma 1, Milan, Italy",
  types: ["restaurant"],
  open_now: true,
  website_url: "https://example.com/osteria",
  maps_url: "https://www.google.com/maps/search/?api=1&query_place_id=mock-milan-pizza-1",
};

export async function mockMilanRestaurantSearch(page: Page) {
  await page.route("**/api/geocode**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ lat: 45.4642, lng: 9.19, cityName: "Milan" }),
    });
  });

  await page.route("**/api/places**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([MILAN_PIZZA_PLACE]),
    });
  });

  await page.route("**/api/weather**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ condition: "Clear", temp: 22 }),
    });
  });
}

export async function mockAiTextStream(page: Page, body: string) {
  await page.route(/\/api\/ai\/?$/, async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "text/event-stream; charset=utf-8",
      body,
    });
  });
}

export async function mockPackGenerate(page: Page) {
  await page.route("**/api/pack/generate**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        items: [
          { id: "mock-1", name: "Passport", category: "Documents", checked: false },
          { id: "mock-2", name: "Comfortable shoes", category: "Clothing", checked: false },
          { id: "mock-3", name: "Phone charger", category: "Electronics", checked: false },
        ],
      }),
    });
  });
}

export async function mockBankParse(page: Page) {
  await page.route("**/api/bank/parse**", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }

    let text = "";
    try {
      const body = route.request().postDataJSON() as { text?: string };
      text = body.text ?? "";
    } catch {
      text = "";
    }

    const places = text
      .split(";")
      .map((segment) => segment.trim())
      .filter((segment) => segment.length > 0)
      .map((name) => ({ name }));

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ places }),
    });
  });
}

export async function mockBankPlacesSubmit(page: Page) {
  await page.route("**/api/bank/places**", async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ success: true, created: 2 }),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ places: [] }),
    });
  });
}
