import { NextResponse } from 'next/server';
import { memoryDb, getDbClient } from '@/lib/db';
import slugify from 'slugify';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const sql = getDbClient();
  
  if (sql) {
    try {
      const comics = await sql`SELECT * FROM comics WHERE id = ${resolvedParams.id} OR slug = ${resolvedParams.id} LIMIT 1`;
      if (comics.length > 0) {
        const c = comics[0];
        return NextResponse.json({
          id: c.id,
          title: c.title,
          slug: c.slug,
          description: c.description,
          coverImage: c.cover_image,
          author: c.author,
          status: c.status,
          genres: c.genres || [],
          createdAt: Number(c.created_at),
          updatedAt: Number(c.updated_at)
        });
      }
    } catch (e) {
      console.error(e);
    }
  }

  const comic = memoryDb.comics.find((c) => c.id === resolvedParams.id || c.slug === resolvedParams.id);
  
  if (!comic) {
    return NextResponse.json({ error: 'Comic not found' }, { status: 404 });
  }
  
  return NextResponse.json(comic);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  try {
    const body = await request.json();
    const slug = body.title ? slugify(body.title, { lower: true, strict: true }) : undefined;
    const updatedAt = Date.now();
    
    const sql = getDbClient();
    if (sql) {
      await sql`
        UPDATE comics 
        SET title = COALESCE(${body.title}, title),
            slug = COALESCE(${slug}, slug),
            description = COALESCE(${body.description}, description),
            cover_image = COALESCE(${body.coverImage}, cover_image),
            author = COALESCE(${body.author}, author),
            status = COALESCE(${body.status}, status),
            genres = COALESCE(${body.genres ? JSON.stringify(body.genres) : null}, genres),
            updated_at = ${updatedAt}
        WHERE id = ${resolvedParams.id}
      `;
      return NextResponse.json({ success: true });
    }

    const index = memoryDb.comics.findIndex((c) => c.id === resolvedParams.id);
    
    if (index === -1) {
      return NextResponse.json({ error: 'Comic not found' }, { status: 404 });
    }
    
    const updatedComic = {
      ...memoryDb.comics[index],
      ...body,
      slug: slug || memoryDb.comics[index].slug,
      updatedAt,
    };
    
    memoryDb.comics[index] = updatedComic;
    return NextResponse.json(updatedComic);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update comic' }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const sql = getDbClient();
  
  if (sql) {
    try {
      await sql`DELETE FROM comics WHERE id = ${resolvedParams.id}`;
      return NextResponse.json({ success: true });
    } catch (e) {
      console.error(e);
      return NextResponse.json({ error: 'Failed to delete comic' }, { status: 500 });
    }
  }

  const index = memoryDb.comics.findIndex((c) => c.id === resolvedParams.id);
  
  if (index === -1) {
    return NextResponse.json({ error: 'Comic not found' }, { status: 404 });
  }
  
  memoryDb.comics.splice(index, 1);
  // Also delete associated chapters
  memoryDb.chapters = memoryDb.chapters.filter((ch) => ch.comicId !== resolvedParams.id);
  
  return NextResponse.json({ success: true });
}
