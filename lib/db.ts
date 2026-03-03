import { neon } from '@neondatabase/serverless';
import { getSettings } from './settings';

export interface Comic {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  author: string;
  status: 'Ongoing' | 'Completed';
  genres: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Chapter {
  id: string;
  comicId: string;
  title: string;
  number: number;
  slug: string;
  images: string[];
  createdAt: number;
}

// In-memory fallback
export const memoryDb = {
  comics: [] as Comic[],
  chapters: [] as Chapter[],
};

// Seed some initial data
memoryDb.comics.push({
  id: '1',
  title: 'Solo Leveling',
  slug: 'solo-leveling',
  description: 'In a world where hunters, humans who possess magical abilities, must battle deadly monsters to protect the human race from certain annihilation...',
  coverImage: 'https://picsum.photos/seed/solo/400/600',
  author: 'Chugong',
  status: 'Completed',
  genres: ['Action', 'Fantasy'],
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

memoryDb.chapters.push({
  id: '1',
  comicId: '1',
  title: 'Chapter 1',
  number: 1,
  slug: 'chapter-1',
  images: [
    'https://picsum.photos/seed/ch1-1/800/1200',
    'https://picsum.photos/seed/ch1-2/800/1200',
    'https://picsum.photos/seed/ch1-3/800/1200',
  ],
  createdAt: Date.now(),
});

export async function initDb() {
  const settings = getSettings();
  if (!settings.databaseUrl) return;

  try {
    const sql = neon(settings.databaseUrl);
    
    await sql`
      CREATE TABLE IF NOT EXISTS comics (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        cover_image TEXT,
        author VARCHAR(255),
        status VARCHAR(50),
        genres JSONB,
        created_at BIGINT,
        updated_at BIGINT
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS chapters (
        id VARCHAR(255) PRIMARY KEY,
        comic_id VARCHAR(255) REFERENCES comics(id) ON DELETE CASCADE,
        title VARCHAR(255),
        number FLOAT,
        slug VARCHAR(255),
        images JSONB,
        created_at BIGINT
      )
    `;
  } catch (error) {
    console.error('Failed to initialize Neon database:', error);
  }
}

// Helper to get Neon client if configured
export function getDbClient() {
  const settings = getSettings();
  if (settings.databaseUrl) {
    return neon(settings.databaseUrl);
  }
  return null;
}

// Initialize on load
initDb().catch(console.error);

