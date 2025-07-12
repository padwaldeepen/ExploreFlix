import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ContentItem } from '../types/content';
import { 
  getTrendingContent, 
  searchContent, 
  getMovies, 
  getAnime, 
  getSeries 
} from '../api/exploreflixApi';

export const useExploreFlix = () => {
  const [trendingContent, setTrendingContent] = useState<ContentItem[]>([]);
  const [movies, setMovies] = useState<ContentItem[]>([]);
  const [anime, setAnime] = useState<ContentItem[]>([]);
  const [series, setSeries] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use refs to prevent multiple API calls
  const hasLoadedTrending = useRef(false);
  const hasLoadedMovies = useRef(false);
  const hasLoadedAnime = useRef(false);
  const hasLoadedSeries = useRef(false);

  // Memoized filtered content
  const filteredTrendingContent = useMemo(() => {
    return trendingContent.filter(item => item && item.id && item.title);
  }, [trendingContent]);

  const filteredMovies = useMemo(() => {
    return movies.filter(item => item && item.id && item.title);
  }, [movies]);

  const filteredAnime = useMemo(() => {
    return anime.filter(item => item && item.id && item.title);
  }, [anime]);

  const filteredSeries = useMemo(() => {
    return series.filter(item => item && item.id && item.title);
  }, [series]);

  // Memoized search function
  const searchContentMemo = useCallback(async (query: string) => {
    if (!query.trim()) return [];
    
    try {
      setError(null);
      const results = await searchContent(query);
      return results.filter(item => item && item.id && item.title);
    } catch (err) {
      setError('Search failed. Please try again.');
      return [];
    }
  }, []);

  // Memoized content loading functions
  const loadTrendingContent = useCallback(async () => {
    if (hasLoadedTrending.current) return;
    
    try {
      setError(null);
      const content = await getTrendingContent();
      setTrendingContent(content);
      hasLoadedTrending.current = true;
    } catch (err) {
      setError('Failed to load trending content');
      hasLoadedTrending.current = true; // Prevent retries
    }
  }, []);

  const loadMovies = useCallback(async () => {
    if (hasLoadedMovies.current) return;
    
    try {
      setError(null);
      const content = await getMovies();
      setMovies(content);
      hasLoadedMovies.current = true;
    } catch (err) {
      setError('Failed to load movies');
      hasLoadedMovies.current = true; // Prevent retries
    }
  }, []);

  const loadAnime = useCallback(async () => {
    if (hasLoadedAnime.current) return;
    
    try {
      setError(null);
      const content = await getAnime();
      setAnime(content);
      hasLoadedAnime.current = true;
    } catch (err) {
      setError('Failed to load anime');
      hasLoadedAnime.current = true; // Prevent retries
    }
  }, []);

  const loadSeries = useCallback(async () => {
    if (hasLoadedSeries.current) return;
    
    try {
      setError(null);
      const content = await getSeries();
      setSeries(content);
      hasLoadedSeries.current = true;
    } catch (err) {
      setError('Failed to load series');
      hasLoadedSeries.current = true; // Prevent retries
    }
  }, []);

  // Memoized content by category
  const getContentByCategory = useCallback((category: string): ContentItem[] => {
    if (!filteredTrendingContent || filteredTrendingContent.length === 0) return [];
    if (category === 'all') return filteredTrendingContent;
    const filtered = filteredTrendingContent.filter((item: ContentItem) => item.type === category);
    
    // If no content for specific category, return all content as fallback
    if (filtered.length === 0 && category !== 'all') {
      return filteredTrendingContent.slice(0, 8);
    }
    
    return filtered;
  }, [filteredTrendingContent]);

  // Memoized editor picks
  const getEditorPicks = useCallback((): ContentItem[] => {
    if (!filteredTrendingContent || filteredTrendingContent.length === 0) return [];
    return filteredTrendingContent.slice(0, 4);
  }, [filteredTrendingContent]);

  // Memoized recently added
  const getRecentlyAdded = useCallback((): ContentItem[] => {
    if (!filteredTrendingContent || filteredTrendingContent.length === 0) return [];
    return filteredTrendingContent.slice(-4).reverse();
  }, [filteredTrendingContent]);

  useEffect(() => {
    const loadAllContent = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          loadTrendingContent(),
          loadMovies(),
          loadAnime(),
          loadSeries()
        ]);
      } catch (err) {
        setError('Failed to load content');
      } finally {
        setIsLoading(false);
      }
    };

    loadAllContent();
  }, [loadTrendingContent, loadMovies, loadAnime, loadSeries]);

  return {
    trendingContent: filteredTrendingContent,
    movies: filteredMovies,
    anime: filteredAnime,
    series: filteredSeries,
    isLoading,
    error,
    searchContent: searchContentMemo,
    getContentByCategory,
    getEditorPicks,
    getRecentlyAdded
  };
}; 