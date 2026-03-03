import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import slugify from 'slugify';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const comic = db.comics.find((c) => c.id === resolvedParams.id || c.slug === resolvedParams.id);
  
  if (!comic) {
    return NextResponse.json({ error: 'Comic not found' }, { status: 404 });
  }
  
  return NextResponse.json(comic);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  try {
    const body = await request.json();
    const index = db.comics.findIndex((c) => c.id === resolvedParams.id);
    
    if (index === -1) {
      return NextResponse.json({ error: 'Comic not found' }, { status: 404 });
    }
    
    const updatedComic = {
      ...db.comics[index],
      ...body,
      slug: body.title ? slugify(body.title, { lower: true, strict: true }) : db.comics[index].slug,
      updatedAt: Date.now(),
    };
    
    db.comics[index] = updatedComic;
    return NextResponse.json(updatedComic);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update comic' }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const index = db.comics.findIndex((c) => c.id === resolvedParams.id);
  
  if (index === -1) {
    return NextResponse.json({ error: 'Comic not found' }, { status: 404 });
  }
  
  db.comics.splice(index, 1);
  // Also delete associated chapters
  db.chapters = db.chapters.filter((ch) => ch.comicId !== resolvedParams.id);
  
  return NextResponse.json({ success: true });
}
