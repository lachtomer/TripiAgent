import { NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({
  entries: z.array(z.string()),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const data = schema.parse(json);
    // TODO: Persist entries to store/database as needed.
    return NextResponse.json({ success: true, received: data.entries }, { status: 201 });
  } catch (error) {
    console.error('Bank places POST error:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
