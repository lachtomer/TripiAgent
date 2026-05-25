import { NextRequest, NextResponse } from "next/server";
import { FerriesQuerySchema } from "@/lib/schemas";
import fs from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const originParam = searchParams.get("origin") || undefined;
  const destinationParam = searchParams.get("destination") || undefined;

  const validation = FerriesQuerySchema.safeParse({
    origin: originParam,
    destination: destinationParam,
  });

  if (!validation.success) {
    return NextResponse.json({ error: "Invalid query parameters" }, { status: 400 });
  }

  const { origin, destination } = validation.data;

  try {
    const jsonPath = path.join(process.cwd(), "public", "data", "lake_garda_ferries_2026.json");
    const fileContent = fs.readFileSync(jsonPath, "utf-8");
    const ferryData = JSON.parse(fileContent);

    let filteredRoutes = ferryData.routes;

    if (origin) {
      filteredRoutes = filteredRoutes.filter(
        (r: { origin: string }) => r.origin.toLowerCase().trim() === origin.toLowerCase().trim()
      );
    }

    if (destination) {
      filteredRoutes = filteredRoutes.filter(
        (r: { destination: string }) => r.destination.toLowerCase().trim() === destination.toLowerCase().trim()
      );
    }

    return NextResponse.json({
      season: ferryData.season,
      routes: filteredRoutes,
    });
  } catch (error) {
    console.error("Failed to read ferry schedule data:", error);
    return NextResponse.json({ error: "Failed to read ferry schedule data" }, { status: 500 });
  }
}
