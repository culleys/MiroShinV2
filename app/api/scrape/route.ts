import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const token = process.env.SCRAPE_DO_TOKEN;
    
    let targetUrl = url;
    if (token) {
      // Use scrape.do if token is available
      targetUrl = `http://api.scrape.do?token=${token}&url=${encodeURIComponent(url)}`;
    }

    const response = await fetch(targetUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    
    const images: string[] = [];
    
    // Common selectors for manga reader themes (like mangareader wordpress theme)
    const selectors = [
      '#readerarea img',
      '.reading-content img',
      '.page-break img',
      '.blocks-gallery-item img',
      '#arraydata' // Sometimes images are in a script tag or hidden div
    ];

    let found = false;
    for (const selector of selectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        elements.each((_, el) => {
          // Check common lazy loading attributes
          const src = $(el).attr('data-src') || $(el).attr('data-lazy-src') || $(el).attr('src');
          if (src && !src.includes('data:image') && !src.includes('pixel')) {
            images.push(src.trim());
          }
        });
        
        if (images.length > 0) {
          found = true;
          break;
        }
      }
    }

    // Fallback: if no specific container found, just grab large images
    if (!found) {
      $('img').each((_, el) => {
        const src = $(el).attr('data-src') || $(el).attr('data-lazy-src') || $(el).attr('src');
        if (src && !src.includes('data:image') && !src.includes('pixel')) {
           images.push(src.trim());
        }
      });
    }

    // Remove duplicates
    const uniqueImages = Array.from(new Set(images));

    return NextResponse.json({ images: uniqueImages });
  } catch (error: any) {
    console.error('Scraping error:', error);
    return NextResponse.json({ error: error.message || 'Failed to scrape' }, { status: 500 });
  }
}
