// Unified content types for ExploreFlix
export interface Content {
  id: string;
  title: string;
  description?: string;
  poster: string;
  year?: string;
  genre?: string[];
  runtime?: string;
  rating?: string;
  type: 'movie' | 'anime' | 'series';
}

export interface Movie extends Content {
  type: 'movie';
  director?: string;
  cast?: string[];
}

export interface Anime extends Content {
  type: 'anime';
  episodes?: number;
  status?: string;
  season?: string;
  studio?: string;
}

export interface Series extends Content {
  type: 'series';
  seasons?: number;
  episodes?: number;
  status?: string;
  network?: string;
}

export interface SearchResponse {
  results: Content[];
  totalResults: number;
  hasMore: boolean;
}

export interface TrendingResponse {
  movies: Movie[];
  anime: Anime[];
  series: Series[];
}

export interface Genre {
  id: number;
  name: string;
}

export interface FilterOptions {
  type?: 'movie' | 'anime' | 'series';
  genre?: string;
  year?: string;
  rating?: string;
  sortBy?: keyof Content;
  sortOrder?: 'asc' | 'desc';
} 