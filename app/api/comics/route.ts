import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import slugify from 'slugify';

export async function GET() {
  return NextResponse.json(db.comics);
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

    db.comics.push(newComic);
    return NextResponse.json(newComic, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create comic' }, { status: 400 });
  }
}
