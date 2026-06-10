import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SearchResult } from '@myjarvis/shared';
import { SearchPort } from '../../domain/ports/search.port';

@Injectable()
export class MultiProviderSearchAdapter implements SearchPort {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async searchWeb(query: string, limit: number): Promise<SearchResult[]> {
    try {
      const { data } = await firstValueFrom(
        this.http.get(`https://api.duckduckgo.com/`, {
          params: { q: query, format: 'json', no_html: 1 },
        }),
      );
      const results: SearchResult[] = [];
      if (data.AbstractText) {
        results.push({
          title: data.Heading || query,
          url: data.AbstractURL || `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
          snippet: data.AbstractText,
          type: 'web',
        });
      }
      for (const topic of (data.RelatedTopics ?? []).slice(0, limit - 1)) {
        if (topic.Text && topic.FirstURL) {
          results.push({ title: topic.Text.slice(0, 80), url: topic.FirstURL, snippet: topic.Text, type: 'web' });
        }
      }
      return results.length ? results : this.mockResults(query, 'web', limit);
    } catch {
      return this.mockResults(query, 'web', limit);
    }
  }

  async searchImages(query: string, limit: number): Promise<SearchResult[]> {
    const key = this.config.get('UNSPLASH_ACCESS_KEY');
    if (key) {
      try {
        const { data } = await firstValueFrom(
          this.http.get('https://api.unsplash.com/search/photos', {
            params: { query, per_page: limit },
            headers: { Authorization: `Client-ID ${key}` },
          }),
        );
        return data.results.map((img: { urls: { regular: string }; alt_description: string; links: { html: string } }) => ({
          title: img.alt_description || query,
          url: img.links.html,
          snippet: img.alt_description || '',
          type: 'image' as const,
          thumbnail: img.urls.regular,
        }));
      } catch { /* fallback */ }
    }
    return this.mockResults(query, 'image', limit);
  }

  async searchVideos(query: string, limit: number): Promise<SearchResult[]> {
    const key = this.config.get('YOUTUBE_API_KEY');
    if (key) {
      try {
        const { data } = await firstValueFrom(
          this.http.get('https://www.googleapis.com/youtube/v3/search', {
            params: { part: 'snippet', q: query, type: 'video', maxResults: limit, key },
          }),
        );
        return data.items.map((item: { id: { videoId: string }; snippet: { title: string; description: string; thumbnails: { medium: { url: string } } } }) => ({
          title: item.snippet.title,
          url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          snippet: item.snippet.description,
          type: 'video' as const,
          thumbnail: item.snippet.thumbnails.medium.url,
        }));
      } catch { /* fallback */ }
    }
    return this.mockResults(query, 'video', limit);
  }

  async searchMusic(query: string, limit: number): Promise<SearchResult[]> {
    return this.mockResults(query, 'music', limit).map((r) => ({
      ...r,
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
    }));
  }

  private mockResults(query: string, type: SearchResult['type'], limit: number): SearchResult[] {
    return Array.from({ length: Math.min(limit, 3) }, (_, i) => ({
      title: `${type} result ${i + 1} for "${query}"`,
      url: `https://example.com/${type}/${encodeURIComponent(query)}`,
      snippet: `Resultado simulado — configure API keys para resultados reais.`,
      type,
    }));
  }
}
