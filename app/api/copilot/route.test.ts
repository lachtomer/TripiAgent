import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextRequest } from "next/server";

// 1. Mock GoogleGenerativeAI
const mockGenerateContent = vi.fn().mockResolvedValue({
  response: {
    text: () => JSON.stringify({
      morningBriefing: "Welcome to Day 2! The weather is sunny and warm at 22°C. Excellent day for driving to Villa Bella Desenzano.",
      serendipity: {
        title: "Aperitivo at Piazza delle Erbe",
        description: "Enjoy a Spritz at Verona's oldest square.",
        category: "Local Food"
      }
    })
  }
});

vi.mock("@google/generative-ai", () => {
  return {
    GoogleGenerativeAI: vi.fn().mockImplementation(() => {
      return {
        getGenerativeModel: vi.fn().mockReturnValue({
          generateContent: mockGenerateContent
        })
      };
    }),
    SchemaType: {
      OBJECT: "OBJECT",
      STRING: "STRING"
    }
  };
});

// 2. Mock environment variables
process.env.GEMINI_API_KEY = "mock-api-key";

describe("POST /api/copilot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return morning briefing and serendipity suggestion for valid inputs", async () => {
    const reqBody = {
      dayNumber: 2,
      date: "2026-06-26",
      itineraryActivities: [
        { id: "a1", time: "10:00", title: "Centauro Car Rental", description: "Pick up rental car" }
      ],
      weatherInfo: {
        temp: 22,
        description: "clear sky"
      },
      cityName: "Verona"
    };

    const request = new NextRequest("http://localhost:9001/api/copilot", {
      method: "POST",
      body: JSON.stringify(reqBody)
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.morningBriefing).toContain("Welcome to Day 2");
    expect(json.serendipity.title).toBe("Aperitivo at Piazza delle Erbe");
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
  });

  it("should return 400 bad request when parameters are invalid", async () => {
    const reqBody = {
      // missing dayNumber
      itineraryActivities: []
    };

    const request = new NextRequest("http://localhost:9001/api/copilot", {
      method: "POST",
      body: JSON.stringify(reqBody)
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.error).toBe("Invalid parameters in request body");
  });
});
