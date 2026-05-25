import { describe, it, expect, vi, beforeEach } from "vitest";
import { agentGraph } from "./agentGraph";

// 1. Mock GoogleGenerativeAI
const mockGenerateContent = vi.fn();

vi.mock("@google/generative-ai", () => {
  return {
    GoogleGenerativeAI: vi.fn().mockImplementation(() => {
      return {
        getGenerativeModel: vi.fn().mockReturnValue({
          generateContent: mockGenerateContent,
        }),
      };
    }),
    SchemaType: {
      OBJECT: "OBJECT",
      STRING: "STRING",
    },
  };
});

process.env.GEMINI_API_KEY = "mock-key";

describe("agentGraph integration tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should route general chat queries directly to assistant node without planning", async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => "Rome is the capital of Italy.",
      },
    });

    const initialState = {
      messages: [
        {
          id: "m1",
          role: "user" as const,
          text: "What is the capital of Italy?",
          timestamp: Date.now(),
        },
      ],
      itinerary: null,
      location: null,
      conflicts: [],
      loopCount: 0,
      routingTarget: "classifier",
      response: "",
    };

    const result = await agentGraph.invoke(initialState);

    // It should go classifier -> assistant -> END
    expect(result.response).toBe("Rome is the capital of Italy.");
    expect(result.routingTarget).toBe("assistant");
    expect(result.loopCount).toBe(0);
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
  });

  it("should route replanning queries to planner and validator node", async () => {
    // Return a valid plan with no conflicts
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => `Here is the plan:
\`\`\`json
{
  "type": "replan",
  "dayNumber": 1,
  "activities": [
    {
      "time": "09:00",
      "title": "Visit Colosseum",
      "description": "Historical guided tour",
      "locationName": "Rome"
    }
  ]
}
\`\`\`
`,
      },
    });

    const initialState = {
      messages: [
        {
          id: "m2",
          role: "user" as const,
          text: "Please replan my day in Rome.",
          timestamp: Date.now(),
        },
      ],
      itinerary: null,
      location: null,
      conflicts: [],
      loopCount: 0,
      routingTarget: "classifier",
      response: "",
    };

    const result = await agentGraph.invoke(initialState);

    // It should go classifier -> planner -> validator -> assistant -> END
    expect(result.response).toContain("Here is the plan:");
    expect(result.routingTarget).toBe("assistant");
    expect(result.loopCount).toBe(1);
    expect(result.conflicts).toHaveLength(0);
  });

  it("should run refinement loop if validator node finds conflicts (e.g. Milan ZTL)", async () => {
    // First call returns a plan containing Milan (active ZTL)
    // Second call returns a generic explanation or adjusted plan
    mockGenerateContent
      .mockResolvedValueOnce({
        response: {
          text: () => `Visiting Milan:
\`\`\`json
{
  "type": "replan",
  "dayNumber": 1,
  "activities": [
    {
      "time": "12:00",
      "title": "Drive through Milan Center",
      "description": "Sightseeing drive",
      "locationName": "Milan Area C"
    }
  ]
}
\`\`\``,
        },
      })
      .mockResolvedValueOnce({
        response: {
          text: () => `Okay, I will keep Milan but alert you about ZTL rules.`,
        },
      });

    const initialState = {
      messages: [
        {
          id: "m3",
          role: "user" as const,
          text: "Replan to include driving in Milan during midday.",
          timestamp: Date.now(),
        },
      ],
      itinerary: null,
      location: null,
      conflicts: [],
      loopCount: 0,
      routingTarget: "classifier",
      response: "",
    };

    const result = await agentGraph.invoke(initialState);

    // It should loop: classifier -> planner -> validator -> planner -> validator -> assistant
    // Since loopCount reached 2, validator stops looping and goes to assistant.
    expect(result.loopCount).toBe(2);
    expect(result.conflicts).toContain("Milan ZTL Area C congestion zone is active (requires €7.50 entry permit ticket).");
    expect(result.response).toContain("Warnings & Travel Notices");
    expect(result.response).toContain("Milan ZTL Area C");
  });
});
