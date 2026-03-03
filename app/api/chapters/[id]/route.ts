import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import slugify from 'slugify';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const chapter = db.chapters.find((c) => c.id === resolvedParams.id || c.slug === resolvedParams.id);
  
  if (!chapter) {
    return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
  }
  
  return NextResponse.json(chapter);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  try {
    const body = await request.json();
    const index = db.chapters.findIndex((c) => c.id === resolvedParams.id);
    
    if (index === -1) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }
    
    const updatedChapter = {
      ...db.chapters[index],
      ...body,
      slug: body.number ? slugify(`chapter-${body.number}`, { lower: true, strict: true }) : db.chapters[index].slug,
    };
    
    db.chapters[index] = updatedChapter;
    return NextResponse.json(updatedChapter);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update chapter' }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const index = db.chapters.findIndex((c) => c.id === resolvedParams.id);
  
  if (index === -1) {
    return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
  }
  
  db.chapters.splice(index, 1);
  return NextResponse.json({ success: true });
}
