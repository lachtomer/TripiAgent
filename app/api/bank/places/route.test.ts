import { describe, it, expect, vi, beforeEach } from "vitest";

const fsMocks = vi.hoisted(() => {
  let fileContent = JSON.stringify({ places: [] as unknown[] });

  return {
    getContent: () => fileContent,
    setContent: (value: string) => {
      fileContent = value;
    },
    mkdir: vi.fn().mockResolvedValue(undefined),
    access: vi.fn().mockResolvedValue(undefined),
    readFile: vi.fn().mockImplementation(async () => fileContent),
    writeFile: vi.fn().mockImplementation(async (_path: string, data: string) => {
      fileContent = data;
    }),
  };
});

vi.mock("fs", () => ({
  promises: {
    mkdir: fsMocks.mkdir,
    access: fsMocks.access,
    readFile: fsMocks.readFile,
    writeFile: fsMocks.writeFile,
  },
}));

import { GET, POST, DELETE } from "./route";

describe("GET /api/bank/places", () => {
  beforeEach(() => {
    fsMocks.setContent(JSON.stringify({ places: [] }));
    vi.clearAllMocks();
  });

  it("returns 200 with places array", async () => {
    fsMocks.setContent(
      JSON.stringify({
        places: [{ name: "Colosseum", category: "cultural" }],
      })
    );

    const response = await GET();
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.places).toHaveLength(1);
    expect(data.places[0].name).toBe("Colosseum");
  });

  it("returns empty array when file has no places key", async () => {
    fsMocks.setContent(JSON.stringify({}));

    const response = await GET();
    const data = await response.json();
    expect(data.places).toEqual([]);
  });
});

describe("POST /api/bank/places", () => {
  beforeEach(() => {
    fsMocks.setContent(JSON.stringify({ places: [] }));
    vi.clearAllMocks();
  });

  it("returns 201 when posting places objects", async () => {
    const request = new Request("http://localhost:9001/api/bank/places", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        places: [
          { name: "Sirmione", category: "nature", createdBy: "Tomer" },
          { name: "Verona Arena", lat: 45.44, lng: 10.99 },
        ],
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.created).toBe(2);

    const stored = JSON.parse(fsMocks.getContent());
    expect(stored.places).toHaveLength(2);
    expect(stored.places[0].name).toBe("Sirmione");
  });

  it("returns 201 when posting string entries", async () => {
    const request = new Request("http://localhost:9001/api/bank/places", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entries: ["Day 1 – Visit Sirmione", "Day 2 – Explore Verona"],
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);

    const data = await response.json();
    expect(data.created).toBe(2);

    const stored = JSON.parse(fsMocks.getContent());
    expect(stored.places[0]).toEqual({ name: "Day 1 – Visit Sirmione" });
  });

  it("appends to existing places", async () => {
    fsMocks.setContent(JSON.stringify({ places: [{ name: "Existing Place" }] }));

    const request = new Request("http://localhost:9001/api/bank/places", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ places: [{ name: "New Place" }] }),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);

    const stored = JSON.parse(fsMocks.getContent());
    expect(stored.places).toHaveLength(2);
    expect(stored.places.map((p: { name: string }) => p.name)).toEqual([
      "Existing Place",
      "New Place",
    ]);
  });

  it("returns 400 for invalid JSON body", async () => {
    const request = new Request("http://localhost:9001/api/bank/places", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ places: [{ name: 123 }] }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBe("Invalid request");
  });

  it("returns 400 for malformed JSON", async () => {
    const request = new Request("http://localhost:9001/api/bank/places", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{ not valid json",
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});

describe("DELETE /api/bank/places", () => {
  beforeEach(() => {
    fsMocks.setContent(
      JSON.stringify({
        places: [{ name: "Colosseum" }, { name: "Pantheon" }],
      })
    );
    vi.clearAllMocks();
  });

  it("returns 200 when requestedBy is a bank admin", async () => {
    const request = new Request("http://localhost:9001/api/bank/places", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ index: 0, requestedBy: "Tomer" }),
    });

    const response = await DELETE(request);
    expect(response.status).toBe(200);

    const stored = JSON.parse(fsMocks.getContent());
    expect(stored.places).toHaveLength(1);
    expect(stored.places[0].name).toBe("Pantheon");
  });

  it("returns 403 when requestedBy is not a bank admin", async () => {
    const request = new Request("http://localhost:9001/api/bank/places", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ index: 0, requestedBy: "Ilanit" }),
    });

    const response = await DELETE(request);
    expect(response.status).toBe(403);

    const stored = JSON.parse(fsMocks.getContent());
    expect(stored.places).toHaveLength(2);
  });

  it("returns 400 when index is out of range", async () => {
    const request = new Request("http://localhost:9001/api/bank/places", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ index: 99, requestedBy: "Liran" }),
    });

    const response = await DELETE(request);
    expect(response.status).toBe(400);
  });
});
