import { Injectable, Inject } from '@nestjs/common';
import { SEARCH_PORT, SearchPort } from '../domain/ports/search.port';

@Injectable()
export class SearchUseCase {
  constructor(@Inject(SEARCH_PORT) private readonly search: SearchPort) {}

  execute(type: 'web' | 'images' | 'videos' | 'music', query: string, limit = 5) {
    const map = {
      web: () => this.search.searchWeb(query, limit),
      images: () => this.search.searchImages(query, limit),
      videos: () => this.search.searchVideos(query, limit),
      music: () => this.search.searchMusic(query, limit),
    };
    return map[type]();
  }
}
