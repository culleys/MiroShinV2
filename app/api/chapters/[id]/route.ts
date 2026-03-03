import { NextResponse } from 'next/server';
import { memoryDb, getDbClient } from '@/lib/db';
import slugify from 'slugify';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const sql = getDbClient();
  
  if (sql) {
    try {
      const chapters = await sql`SELECT * FROM chapters WHERE id = ${resolvedParams.id} OR slug = ${resolvedParams.id} LIMIT 1`;
      if (chapters.length > 0) {
        const c = chapters[0];
        return NextResponse.json({
          id: c.id,
          comicId: c.comic_id,
          title: c.title,
          number: Number(c.number),
          slug: c.slug,
          images: c.images || [],
          createdAt: Number(c.created_at)
        });
      }
    } catch (e) {
      console.error(e);
    }
  }

  const chapter = memoryDb.chapters.find((c) => c.id === resolvedParams.id || c.slug === resolvedParams.id);
  
  if (!chapter) {
    return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
  }
  
  return NextResponse.json(chapter);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  try {
    const body = await request.json();
    const slug = body.number ? slugify(`chapter-${body.number}`, { lower: true, strict: true }) : undefined;
    
    const sql = getDbClient();
    if (sql) {
      await sql`
        UPDATE chapters 
        SET title = COALESCE(${body.title}, title),
            number = COALESCE(${body.number}, number),
            slug = COALESCE(${slug}, slug),
            images = COALESCE(${body.images ? JSON.stringify(body.images) : null}, images)
        WHERE id = ${resolvedParams.id}
      `;
      return NextResponse.json({ success: true });
    }

    const index = memoryDb.chapters.findIndex((c) => c.id === resolvedParams.id);
    
    if (index === -1) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }
    
    const updatedChapter = {
      ...memoryDb.chapters[index],
      ...body,
      slug: slug || memoryDb.chapters[index].slug,
    };
    
    memoryDb.chapters[index] = updatedChapter;
    return NextResponse.json(updatedChapter);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update chapter' }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const sql = getDbClient();
  
  if (sql) {
    try {
      await sql`DELETE FROM chapters WHERE id = ${resolvedParams.id}`;
      return NextResponse.json({ success: true });
    } catch (e) {
      console.error(e);
      return NextResponse.json({ error: 'Failed to delete chapter' }, { status: 500 });
    }
  }

  const index = memoryDb.chapters.findIndex((c) => c.id === resolvedParams.id);
  
  if (index === -1) {
    return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
  }
  
  memoryDb.chapters.splice(index, 1);
  return NextResponse.json({ success: true });
}
