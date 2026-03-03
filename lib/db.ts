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

// In-memory database for prototype
export const db = {
  comics: [] as Comic[],
  chapters: [] as Chapter[],
};

// Seed some initial data
db.comics.push({
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

db.chapters.push({
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
