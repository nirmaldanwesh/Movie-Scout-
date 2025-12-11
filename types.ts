export enum LoadingStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface Movie {
  title: string;
  language: string;
  releaseDate: string;
  status: string; // e.g. "Blockbuster", "Critical Darling"
  rottenTomatoes: string; // e.g. "95%"
  imdb: string; // e.g. "8.2/10"
  availability: string; // e.g. "Netflix", "Theaters", "Prime Video"
  summary: string;
  redditVibe: string;
  lastUpdated?: string; // For watchlist tracking
  director?: string;
  cast?: string[];
}

export interface SearchResult {
  movies: Movie[];
  groundingChunks: GroundingChunk[];
}

export interface EmailDraft {
  subject: string;
  body: string;
}

export type Tab = 'hits' | 'ott' | 'watchlist';