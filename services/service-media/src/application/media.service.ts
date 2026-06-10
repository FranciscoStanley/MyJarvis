import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface MediaItem {
  title: string;
  url: string;
  embedUrl?: string;
  type: 'music' | 'video';
  thumbnail?: string;
}

@Injectable()
export class MediaService {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async search(query: string, type: 'music' | 'video' = 'video'): Promise<MediaItem[]> {
    const searchUrl = this.config.get('SEARCH_SERVICE_URL', 'http://localhost:3004');
    const endpoint = type === 'music' ? 'music' : 'videos';
    try {
      const { data } = await firstValueFrom(
        this.http.post(`${searchUrl}/api/search/${endpoint}`, { query, limit: 5 }),
      );
      return (data.data ?? []).map((item: { title: string; url: string; thumbnail?: string }) => ({
        title: item.title,
        url: item.url,
        embedUrl: this.extractEmbedUrl(item.url),
        type,
        thumbnail: item.thumbnail,
      }));
    } catch {
      return [{
        title: query,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
        type,
      }];
    }
  }

  async getPlayableUrl(query: string): Promise<MediaItem> {
    const results = await this.search(query, 'music');
    return results[0] ?? { title: query, url: '', type: 'music' };
  }

  private extractEmbedUrl(url: string): string | undefined {
    const match = url.match(/v=([a-zA-Z0-9_-]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : undefined;
  }
}
