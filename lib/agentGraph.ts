import { GoogleGenerativeAI } from "@google/generative-ai";
import { StateGraph, Annotation, START, END } from "@langchain/langgraph";
import { ChatMessage, ItineraryDay, LocationDetails, Activity, WeatherSnapshot } from "@/types";
import { checkMilanZTL } from "./ztl";
import fs from "fs";
import path from "path";

// 1. Define State Annotation
export const AgentStateAnnotation = Annotation.Root({
  messages: Annotation<ChatMessage[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  itinerary: Annotation<ItineraryDay[] | null>({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
  location: Annotation<LocationDetails | null>({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
  conflicts: Annotation<string[]>({
    reducer: (x, y) => y, // Overwrite with latest check results
    default: () => [],
  }),
  loopCount: Annotation<number>({
    reducer: (x, y) => y,
    default: () => 0,
  }),
  weather: Annotation<WeatherSnapshot | null>({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
  routingTarget: Annotation<string>({
    reducer: (x, y) => y,
    default: () => "assistant",
  }),
  response: Annotation<string>({
    reducer: (x, y) => y,
    default: () => "",
  }),
  dayAnchors: Annotation<Record<number, string>>({
    reducer: (x, y) => y,
    default: () => ({}),
  }),
});

export type AgentStateType = typeof AgentStateAnnotation.State;

// 2. Nodes Implementation

// Heuristic/LLM Classifier Node
async function classifierNode(state: AgentStateType): Promise<Partial<AgentStateType>> {
  const latestMessage = state.messages[state.messages.length - 1];
  if (!latestMessage) {
    return { routingTarget: "assistant" };
  }

  const text = latestMessage.text.toLowerCase();
  const editKeywords = [
    "replan", "adjust", "schedule", "swap", "add activity", "delete", "remove", 
    "change activity", "itinerary", "insert", "move", "cancel"
  ];

  const requiresPlanning = editKeywords.some(keyword => text.includes(keyword));
  return {
    routingTarget: requiresPlanning ? "planner" : "assistant",
  };
}

// Planner Node using Gemini
async function plannerNode(state: AgentStateType): Promise<Partial<AgentStateType>> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { response: "API Key missing.", routingTarget: "assistant" };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const model = genAI.getGenerativeModel({ model: modelName });

  const latestMessage = state.messages[state.messages.length - 1]?.text || "";
  const currentItinerary = state.itinerary ? JSON.stringify(state.itinerary) : "None";
  const dayAnchorsText = state.dayAnchors ? JSON.stringify(state.dayAnchors) : "None";
  const conflictNotes = state.conflicts.length > 0
    ? `⚠️ Validation Conflicts Found:\n${state.conflicts.map(c => `- ${c}`).join("\n")}\n\nPlease revise the schedule to avoid these issues.`
    : "";

  const prompt = `
  You are the Planner Node of TripiAgent. Your task is to update or adjust the itinerary based on the user request.

  Active Itinerary:
  ${currentItinerary}

  Day Anchors (User planned base location for each day):
  ${dayAnchorsText}

  User Request: ${latestMessage}

  ${conflictNotes}

  Instructions:
  Explain the suggested changes in text, and you MUST append a structured JSON block at the very end of your response inside a markdown block:
  \`\`\`json
  {
    "type": "replan",
    "dayNumber": 1, 
    "activities": [
      {
        "time": "12:00",
        "title": "Activity Title",
        "description": "Activity description",
        "locationName": "Location"
      }
    ]
  }
  \`\`\`
  Ensure Day number is correct and activities have time slot strings.
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    return {
      response: responseText,
      routingTarget: "validator",
    };
  } catch (error) {
    console.error("Planner node error:", error);
    return {
      response: "Sorry, I had trouble planning this.",
      routingTarget: "assistant",
    };
  }
}

// Validator Node (Milan ZTL, Ferry constraints)
async function validatorNode(state: AgentStateType): Promise<Partial<AgentStateType>> {
  const currentConflicts: string[] = [];
  const responseText = state.response;
  
  // Extract JSON payload from Gemini response text
  let proposedActivities: Activity[] = [];
  const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
  
  if (jsonMatch && jsonMatch[1]) {
    try {
      const payload = JSON.parse(jsonMatch[1]);
      if (payload.type === "replan" && Array.isArray(payload.activities)) {
        proposedActivities = payload.activities;
      }
    } catch {
      // JSON parsing failure
    }
  }

  // 1. ZTL validation for Milan Area C
  const hasMilanText = responseText.toLowerCase().includes("milan") || 
    proposedActivities.some(a => a.title.toLowerCase().includes("milan") || (a.locationName && a.locationName.toLowerCase().includes("milan")));

  if (hasMilanText) {
    // Check if the drive is scheduled on a weekday during active hours
    // We assume default test day is Monday if dates are missing
    const ztlResult = checkMilanZTL("12:00", "Monday");
    if (ztlResult.active) {
      currentConflicts.push("Milan ZTL Area C congestion zone is active (requires €7.50 entry permit ticket).");
    }
  }

  // 2. Ferry Validation for Lake Garda
  const ferryActivities = proposedActivities.filter(a => 
    a.title.toLowerCase().includes("ferry") || 
    a.description.toLowerCase().includes("ferry")
  );

  if (ferryActivities.length > 0) {
    try {
      const jsonPath = path.join(process.cwd(), "public", "data", "lake_garda_ferries_2026.json");
      const fileContent = fs.readFileSync(jsonPath, "utf-8");
      const ferryData = JSON.parse(fileContent);
      
      for (const act of ferryActivities) {
        const text = (act.title + " " + act.description).toLowerCase();
        const towns = ["desenzano", "sirmione", "peschiera", "riva", "limone", "malcesine"];
        const foundTowns = towns.filter(town => text.includes(town));
        
        if (foundTowns.length >= 2) {
          const origin = foundTowns[0];
          const destination = foundTowns[1];
          
          interface FerryRoute {
            origin: string;
            destination: string;
          }
          const routeExists = ferryData.routes.some((r: FerryRoute) => 
            (r.origin.toLowerCase() === origin && r.destination.toLowerCase() === destination) ||
            (r.origin.toLowerCase() === destination && r.destination.toLowerCase() === origin)
          );
          
          if (!routeExists) {
            currentConflicts.push(`Ferry route between ${origin.charAt(0).toUpperCase() + origin.slice(1)} and ${destination.charAt(0).toUpperCase() + destination.slice(1)} does not exist in the Summer 2026 schedule.`);
          }
        } else if (foundTowns.length === 1) {
          currentConflicts.push(`Ferry activity mentions ${foundTowns[0].charAt(0).toUpperCase() + foundTowns[0].slice(1)} but lacks a clear origin/destination town.`);
        }
      }
    } catch (err) {
      console.error("Ferry validation failed:", err);
    }
  }

  // 3. Weather Forecast Validation
  if (state.weather) {
    const condition = state.weather.condition.toLowerCase();
    const isRainy = condition.includes("rain") || condition.includes("shower") || condition.includes("storm") || condition.includes("drizzle");
    
    if (isRainy) {
      const outdoorKeywords = ["swim", "beach", "boat", "hike", "walk", "outdoor", "gardens", "pool", "kayak"];
      const conflictingOutdoorActivities = proposedActivities.filter(a => 
        outdoorKeywords.some(kw => a.title.toLowerCase().includes(kw) || a.description.toLowerCase().includes(kw))
      );
      
      for (const act of conflictingOutdoorActivities) {
        currentConflicts.push(`Outdoor activity "${act.title}" is scheduled despite a rainy weather forecast (${state.weather.condition}).`);
      }
    }
  }

  // 4. Crowd Load Validation
  const crowdedPlaces = ["colosseum", "arena di verona", "sirmione castle", "scaligero castle", "aquaria spa", "vatican", "uffizi"];
  for (const act of proposedActivities) {
    const titleLower = act.title.toLowerCase();
    const isCrowdedPlace = crowdedPlaces.some(cp => titleLower.includes(cp) || (act.locationName && act.locationName.toLowerCase().includes(cp)));
    
    if (isCrowdedPlace) {
      const hour = parseInt(act.time.split(":")[0]);
      if (!isNaN(hour) && hour >= 10 && hour <= 15) {
        currentConflicts.push(`High Crowd Warning: "${act.title}" is scheduled during peak hours (${act.time}). Consider moving this to early morning (before 10:00) or late afternoon (after 16:00) to avoid heavy crowds.`);
      }
    }
  }

  // Determine routing target based on conflicts
  const nextLoop = state.loopCount + 1;
  const shouldRetry = currentConflicts.length > 0 && nextLoop < 2; // Maximum 2 refinement loops

  return {
    conflicts: currentConflicts,
    loopCount: nextLoop,
    routingTarget: shouldRetry ? "planner" : "assistant",
  };
}

// Assistant Node (Final formatting and explanations)
async function assistantNode(state: AgentStateType): Promise<Partial<AgentStateType>> {
  let finalResponse = state.response;
  if (!finalResponse) {
    const latestMessage = state.messages[state.messages.length - 1]?.text || "";
    // General chat fallback
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-2.5-flash" });
      const result = await model.generateContent(latestMessage);
      finalResponse = result.response.text();
    } else {
      finalResponse = "Sorry, my server API key is offline.";
    }
  }

  // If conflicts remained unresolved, prepend them as warnings to the user
  if (state.conflicts.length > 0) {
    const warningHeader = `⚠️ **Warnings & Travel Notices:**\n${state.conflicts.map(c => `- ${c}`).join("\n")}\n\n`;
    finalResponse = warningHeader + finalResponse;
  }

  return {
    response: finalResponse,
  };
}

// 3. Compile Graph Routing

const workflow = new StateGraph(AgentStateAnnotation)
  .addNode("classifier", classifierNode)
  .addNode("planner", plannerNode)
  .addNode("validator", validatorNode)
  .addNode("assistant", assistantNode);

workflow.addEdge(START, "classifier");

workflow.addConditionalEdges(
  "classifier",
  (state) => state.routingTarget,
  {
    planner: "planner",
    assistant: "assistant",
  }
);

workflow.addEdge("planner", "validator");

workflow.addConditionalEdges(
  "validator",
  (state) => state.routingTarget,
  {
    planner: "planner",
    assistant: "assistant",
  }
);

workflow.addEdge("assistant", END);

export const agentGraph = workflow.compile();
