import { NextResponse } from 'next/server';
import { memoryDb, getDbClient } from '@/lib/db';
import slugify from 'slugify';

export async function GET() {
  const sql = getDbClient();
  if (sql) {
    try {
      const comics = await sql`SELECT * FROM comics ORDER BY updated_at DESC`;
      return NextResponse.json(comics.map(c => ({
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
      })));
    } catch (e) {
      console.error(e);
      return NextResponse.json(memoryDb.comics);
    }
  }
  return NextResponse.json(memoryDb.comics);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, coverImage, author, status, genres } = body;

    const newComic = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      slug: slugify(title, { lower: true, strict: true }),
      description,
      coverImage,
      author,
      status,
      genres: genres || [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const sql = getDbClient();
    if (sql) {
      await sql`
        INSERT INTO comics (id, title, slug, description, cover_image, author, status, genres, created_at, updated_at)
        VALUES (${newComic.id}, ${newComic.title}, ${newComic.slug}, ${newComic.description}, ${newComic.coverImage}, ${newComic.author}, ${newComic.status}, ${JSON.stringify(newComic.genres)}, ${newComic.createdAt}, ${newComic.updatedAt})
      `;
    } else {
      memoryDb.comics.push(newComic);
    }
    
    return NextResponse.json(newComic, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create comic' }, { status: 400 });
  }
}
