import { NextResponse } from 'next/server';
import { memoryDb, getDbClient } from '@/lib/db';
import slugify from 'slugify';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const comicId = searchParams.get('comicId');
  
  const sql = getDbClient();
  if (sql) {
    try {
      if (comicId) {
        const chapters = await sql`SELECT * FROM chapters WHERE comic_id = ${comicId} ORDER BY number DESC`;
        return NextResponse.json(chapters.map(c => ({
          id: c.id,
          comicId: c.comic_id,
          title: c.title,
          number: Number(c.number),
          slug: c.slug,
          images: c.images || [],
          createdAt: Number(c.created_at)
        })));
      } else {
        const chapters = await sql`SELECT * FROM chapters ORDER BY created_at DESC`;
        return NextResponse.json(chapters.map(c => ({
          id: c.id,
          comicId: c.comic_id,
          title: c.title,
          number: Number(c.number),
          slug: c.slug,
          images: c.images || [],
          createdAt: Number(c.created_at)
        })));
      }
    } catch (e) {
      console.error(e);
    }
  }

  if (comicId) {
    const chapters = memoryDb.chapters.filter((ch) => ch.comicId === comicId);
    return NextResponse.json(chapters.sort((a, b) => b.number - a.number));
  }
  
  return NextResponse.json(memoryDb.chapters);
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

    const sql = getDbClient();
    if (sql) {
      await sql`
        INSERT INTO chapters (id, comic_id, title, number, slug, images, created_at)
        VALUES (${newChapter.id}, ${newChapter.comicId}, ${newChapter.title}, ${newChapter.number}, ${newChapter.slug}, ${JSON.stringify(newChapter.images)}, ${newChapter.createdAt})
      `;
      await sql`UPDATE comics SET updated_at = ${Date.now()} WHERE id = ${comicId}`;
    } else {
      memoryDb.chapters.push(newChapter);
      
      // Update comic's updatedAt
      const comicIndex = memoryDb.comics.findIndex(c => c.id === comicId);
      if (comicIndex !== -1) {
        memoryDb.comics[comicIndex].updatedAt = Date.now();
      }
    }

    return NextResponse.json(newChapter, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create chapter' }, { status: 400 });
  }
}
