import { useState, useCallback } from 'react';
import { movieApi, Movie, MovieDetailResponse } from '@/api/movieApi';

interface UseMoviesReturn {
  movies: Movie[];
  loading: boolean;
  error: string | null;
  searchMovies: (query: string) => Promise<void>;
  clearMovies: () => void;
}

interface UseMovieDetailReturn {
  movie: MovieDetailResponse | null;
  loading: boolean;
  error: string | null;
  fetchMovieDetail: (imdbId: string) => Promise<void>;
}

export const useMovies = (): UseMoviesReturn => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchMovies = useCallback(async (query: string) => {
    if (!query.trim()) {
      setMovies([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await movieApi.searchMovies(query);
      setMovies(response.Search || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch movies');
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearMovies = useCallback(() => {
    setMovies([]);
    setError(null);
  }, []);

  return {
    movies,
    loading,
    error,
    searchMovies,
    clearMovies,
  };
};

export const useMovieDetail = (): UseMovieDetailReturn => {
  const [movie, setMovie] = useState<MovieDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMovieDetail = useCallback(async (imdbId: string) => {
    setLoading(true);
    setError(null);

    try {
      const movieDetail = await movieApi.getMovieDetails(imdbId);
      setMovie(movieDetail);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch movie details');
      setMovie(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    movie,
    loading,
    error,
    fetchMovieDetail,
  };
}; 