import { NextResponse } from 'next/server';
import { z } from 'zod';
import { promises as fs } from 'fs';
import path from 'path';
import { isBankAdminName } from '@/lib/bankPermissions';

// Define schema accepting either simple entries or full place objects
const placeSchema = z.object({
  name: z.string(),
  category: z.string().optional(),
  description: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  createdBy: z.string().optional()
});

const schema = z.object({
  entries: z.array(z.string()).optional(),
  places: z.array(placeSchema).optional()
});

const deleteSchema = z.object({
  index: z.number().int().min(0),
  requestedBy: z.string().min(1),
});
type Place = z.infer<typeof placeSchema>;

const dataFilePath = path.join(process.cwd(), 'data', 'bank.json');

async function ensureDataFile() {
  try {
    await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
    await fs.access(dataFilePath);
  } catch {
    await fs.writeFile(dataFilePath, JSON.stringify({ places: [] }, null, 2));
  }
}

async function getStoredPlaces(): Promise<Place[]> {
  await ensureDataFile();
  const content = await fs.readFile(dataFilePath, 'utf-8');
  const parsed = JSON.parse(content);
  return Array.isArray(parsed.places) ? parsed.places : [];
}

async function savePlaces(places: Place[]) {
  await ensureDataFile();
  await fs.writeFile(dataFilePath, JSON.stringify({ places }, null, 2));
}

export async function GET() {
  const places = await getStoredPlaces();
  return NextResponse.json({ places }, { status: 200 });
}

export async function POST(request: Request) {
  try {
    const json = (await request.json()) as unknown;
    const data = schema.parse(json);
    const newPlaces = data.places ?? (data.entries?.map(name => ({ name })) ?? []);
    const existing = await getStoredPlaces();
    const updated = [...existing, ...newPlaces];
    await savePlaces(updated);
    return NextResponse.json({ success: true, created: newPlaces.length }, { status: 201 });
  } catch (error) {
    console.error('Bank places POST error:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const json = (await request.json()) as unknown;
    const data = deleteSchema.parse(json);

    if (!isBankAdminName(data.requestedBy)) {
      return NextResponse.json(
        { error: 'Only bank admins can delete entries' },
        { status: 403 }
      );
    }

    const existing = await getStoredPlaces();
    if (data.index >= existing.length) {
      return NextResponse.json({ error: 'Index out of range' }, { status: 400 });
    }

    const updated = existing.filter((_: Place, i: number) => i !== data.index);
    await savePlaces(updated);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Bank places DELETE error:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
