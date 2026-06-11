import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { search as ddgSearch, searchImages, searchVideos } from 'duck-duck-scrape';
import { SearchResult } from '@myjarvis/shared';
import { SearchPort } from '../../domain/ports/search.port';

@Injectable()
export class FreeSearchAdapter implements SearchPort {
  constructor(private readonly http: HttpService) {}

  async searchWeb(query: string, limit: number): Promise<SearchResult[]> {
    try {
      const { data } = await firstValueFrom(
        this.http.get('https://api.duckduckgo.com/', {
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
          results.push({
            title: topic.Text.slice(0, 80),
            url: topic.FirstURL,
            snippet: topic.Text,
            type: 'web',
          });
        }
      }

      if (results.length) return results.slice(0, limit);

      const ddgResults = await ddgSearch(query, { safeSearch: -1 });
      return (ddgResults.results ?? []).slice(0, limit).map((r) => ({
        title: r.title,
        url: r.url,
        snippet: r.description ?? '',
        type: 'web' as const,
      }));
    } catch {
      return this.fallbackWeb(query);
    }
  }

  async searchImages(query: string, limit: number): Promise<SearchResult[]> {
    try {
      const images = await searchImages(query, { safeSearch: -1 });
      const items = (images.results ?? []).slice(0, limit);
      if (items.length) {
        return items.map((img) => ({
          title: img.title || query,
          url: img.url,
          snippet: img.source ?? '',
          type: 'image' as const,
          thumbnail: img.image,
        }));
      }
    } catch { /* Wikimedia fallback */ }

    return this.searchWikimediaImages(query, limit);
  }

  async searchVideos(query: string, limit: number): Promise<SearchResult[]> {
    try {
      const videos = await searchVideos(query, { safeSearch: -1 });
      return (videos.results ?? []).slice(0, limit).map((v) => ({
        title: v.title,
        url: v.url,
        snippet: v.description ?? '',
        type: 'video' as const,
        thumbnail: v.image,
      }));
    } catch {
      return [{
        title: query,
        url: `https://duckduckgo.com/?q=${encodeURIComponent(query)}&ia=videos`,
        snippet: 'Busca de vídeos via DuckDuckGo',
        type: 'video',
      }];
    }
  }

  async searchMusic(query: string, limit: number): Promise<SearchResult[]> {
    try {
      const { data } = await firstValueFrom(
        this.http.get('https://archive.org/advancedsearch.php', {
          params: {
            q: `(${query}) AND mediatype:audio`,
            fl: 'identifier,title,description',
            rows: limit,
            output: 'json',
          },
        }),
      );

      const docs = data.response?.docs ?? [];
      if (docs.length) {
        return docs.map((doc: { identifier: string; title: string; description?: string }) => ({
          title: doc.title || query,
          url: `https://archive.org/details/${doc.identifier}`,
          snippet: doc.description?.slice(0, 120) ?? 'Áudio gratuito — Internet Archive',
          type: 'music' as const,
        }));
      }
    } catch { /* fallback */ }

    return [{
      title: `Música: ${query}`,
      url: `https://duckduckgo.com/?q=${encodeURIComponent(query + ' music')}&ia=videos`,
      snippet: 'Busca musical via DuckDuckGo (100% gratuito)',
      type: 'music',
    }];
  }

  private async searchWikimediaImages(query: string, limit: number): Promise<SearchResult[]> {
    try {
      const { data } = await firstValueFrom(
        this.http.get('https://commons.wikimedia.org/w/api.php', {
          params: {
            action: 'query',
            generator: 'search',
            gsrsearch: query,
            gsrlimit: limit,
            prop: 'imageinfo',
            iiprop: 'url|mime',
            format: 'json',
            origin: '*',
          },
        }),
      );

      const pages = data.query?.pages ?? {};
      type WikiPage = { title: string; imageinfo?: { url: string }[] };
      return (Object.values(pages) as WikiPage[]).map((page) => ({
        title: page.title,
        url: page.imageinfo?.[0]?.url ?? `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title)}`,
        snippet: 'Imagem — Wikimedia Commons (domínio público / licenças livres)',
        type: 'image' as const,
        thumbnail: page.imageinfo?.[0]?.url,
      }));
    } catch {
      return [{
        title: query,
        url: `https://duckduckgo.com/?q=${encodeURIComponent(query)}&ia=images`,
        snippet: 'Busca de imagens via DuckDuckGo',
        type: 'image',
      }];
    }
  }

  private fallbackWeb(query: string): SearchResult[] {
    return [{
      title: query,
      url: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
      snippet: 'Resultado via DuckDuckGo',
      type: 'web',
    }];
  }
}
