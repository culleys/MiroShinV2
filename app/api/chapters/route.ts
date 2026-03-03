import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import slugify from 'slugify';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const comicId = searchParams.get('comicId');
  
  if (comicId) {
    const chapters = db.chapters.filter((ch) => ch.comicId === comicId);
    return NextResponse.json(chapters.sort((a, b) => b.number - a.number));
  }
  
  return NextResponse.json(db.chapters);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { comicId, title, number, images } = body;

    const newChapter = {
      id: Math.random().toString(36).substring(2, 9),
      comicId,
      title,
      number: Number(number),
      slug: slugify(`chapter-${number}`, { lower: true, strict: true }),
      images: images || [],
      createdAt: Date.now(),
    };

    db.chapters.push(newChapter);
    
    // Update comic's updatedAt
    const comicIndex = db.comics.findIndex(c => c.id === comicId);
    if (comicIndex !== -1) {
      db.comics[comicIndex].updatedAt = Date.now();
    }

    return NextResponse.json(newChapter, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create chapter' }, { status: 400 });
  }
}
