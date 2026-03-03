import { NextResponse } from 'next/server';
import { getSettings, saveSettings } from '@/lib/settings';
import { initDb } from '@/lib/db';

export async function GET() {
  const settings = getSettings();
  return NextResponse.json(settings);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const updated = saveSettings(body);
    
    // Initialize DB if URL was provided
    if (updated.databaseUrl) {
      await initDb();
    }
    
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
