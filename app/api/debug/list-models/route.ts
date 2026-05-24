import { NextResponse } from 'next/server';

/**
 * Calls the Gemini REST API to list available models so we can find
 * a valid model name for generateContent.
 */
export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing GEMINI_API_KEY' }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      { cache: 'no-store' }
    );
    const data = await res.json();
    // Filter down to models that support generateContent
    const generateContentModels = (data.models ?? [])
      .filter((m: { supportedGenerationMethods?: string[] }) =>
        m.supportedGenerationMethods?.includes('generateContent')
      )
      .map((m: { name: string; displayName?: string }) => ({
        name: m.name,
        displayName: m.displayName,
      }));
    return NextResponse.json({ generateContentModels, raw: data.models?.length });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
