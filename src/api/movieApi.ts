// Movie API service using OMDb API
// Note: OMDb API is free for basic usage (1000 requests per day)

export interface Movie {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

export interface MovieSearchResponse {
  Search: Movie[];
  totalResults: string;
  Response: string;
}

export interface MovieDetailResponse {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Poster: string;
  Ratings: Array<{ Source: string; Value: string }>;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  DVD: string;
  BoxOffice: string;
  Production: string;
  Website: string;
  Response: string;
}

const OMDB_API_KEY = 'demo'; // Using demo key for development
const OMDB_BASE_URL = 'https://www.omdbapi.com/';

class MovieApiService {
  private async makeRequest<T>(params: Record<string, string>): Promise<T> {
    const searchParams = new URLSearchParams({
      apikey: OMDB_API_KEY,
      ...params,
    });

    const response = await fetch(`${OMDB_BASE_URL}?${searchParams}`);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.Response === 'False') {
      throw new Error(data.Error || 'Unknown API error');
    }

    return data;
  }

  async searchMovies(query: string, page: number = 1): Promise<MovieSearchResponse> {
    return this.makeRequest<MovieSearchResponse>({
      s: query,
      page: page.toString(),
    });
  }

  async getMovieDetails(imdbId: string): Promise<MovieDetailResponse> {
    return this.makeRequest<MovieDetailResponse>({
      i: imdbId,
      plot: 'full',
    });
  }

  async getMoviesByTitle(title: string): Promise<Movie[]> {
    try {
      const response = await this.searchMovies(title);
      return response.Search || [];
    } catch (error) {
      console.error('Error fetching movies by title:', error);
      return [];
    }
  }
}

export const movieApi = new MovieApiService(); 