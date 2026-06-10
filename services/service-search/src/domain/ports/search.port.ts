import { SearchResult } from '@myjarvis/shared';

export interface SearchPort {
  searchWeb(query: string, limit: number): Promise<SearchResult[]>;
  searchImages(query: string, limit: number): Promise<SearchResult[]>;
  searchVideos(query: string, limit: number): Promise<SearchResult[]>;
  searchMusic(query: string, limit: number): Promise<SearchResult[]>;
}
export const SEARCH_PORT = Symbol('SEARCH_PORT');
