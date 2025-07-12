export interface ContentItem {
  id: string;
  title: string;
  type: 'movie' | 'anime' | 'series';
  poster: string;
  plot?: string;
  year?: string;
  genre?: string;
  runtime?: string;
  rating?: string;
  featured?: boolean;
  cast?: string;
  director?: string;
  episodes?: number;
  status?: string;
  season?: string;
  studio?: string;
} 