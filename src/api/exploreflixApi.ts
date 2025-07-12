import { ContentItem } from '../types/content';

// API Base URLs
const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';
const OMDB_BASE_URL = 'https://www.omdbapi.com';
const OMDB_API_KEY = 'b9dadde8';

// API Types
interface JikanAnimeResponse {
  data: Array<{
    mal_id: number;
    title: string;
    title_english: string;
    synopsis: string;
    images: {
      jpg: { image_url: string };
      webp: { image_url: string };
    };
    year: number;
    genres: Array<{ name: string }>;
    duration: string;
    score: number;
  }>;
  pagination: {
    has_next_page: boolean;
  };
}

interface OMDBMovieResponse {
  Search: Array<{
    imdbID: string;
    Title: string;
    Year: string;
    Poster: string;
    Type: string;
  }>;
  totalResults: string;
  Response: string;
}

interface OMDBMovieDetail {
  imdbID: string;
  Title: string;
  Year: string;
  Poster: string;
  Plot: string;
  Genre: string;
  Runtime: string;
  imdbRating: string;
  Response: string;
  Actors?: string;
  Director?: string;
}

// Helper function to delay requests (to respect rate limits)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to handle API errors
const handleApiError = (error: any, endpoint: string) => {
  console.error(`API Error (${endpoint}):`, error);
  // Return empty array instead of throwing to prevent infinite loops
  return [];
};

// Helper function to make API requests with retry logic and timeout
const makeApiRequest = async (url: string, retries = 1, timeout = 10000): Promise<any> => {
  for (let i = 0; i < retries; i++) {
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), timeout);
      });
      
      // Create the fetch promise
      const fetchPromise = fetch(url);
      
      // Race between fetch and timeout
      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;
      
      if (response.status === 429) {
        // Rate limited, wait longer
        await delay(1000 * (i + 1));
        continue;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      if (i === retries - 1) {
        // Don't throw on final retry, just return null to indicate failure
        console.warn(`API request failed after ${retries} attempts:`, url, error);
        return null;
      }
      await delay(500 * (i + 1));
    }
  }
  return null;
};

// Fetch trending anime from Jikan API
export const fetchTrendingAnime = async (): Promise<ContentItem[]> => {
  try {
    await delay(300); // Reduced rate limiting for Jikan
    
    // Get multiple types of trending anime for better variety
    const endpoints = [
      `${JIKAN_BASE_URL}/top/anime?filter=airing&limit=4`, // Currently airing
      `${JIKAN_BASE_URL}/top/anime?filter=bypopularity&limit=4`, // Most popular
      `${JIKAN_BASE_URL}/top/anime?filter=favorite&limit=4` // Most favorited
    ];
    
    const animePromises = endpoints.map(async (endpoint, index) => {
      try {
        await delay(index * 200); // Stagger requests
        const data: JikanAnimeResponse = await makeApiRequest(endpoint);
        
        // Check if the request failed
        if (!data || !data.data) {
          console.warn(`Anime API request failed for ${endpoint}, skipping...`);
          return [];
        }
        
        return data.data || [];
      } catch (error) {
        console.warn(`Error fetching anime from ${endpoint}:`, error);
        return [];
      }
    });
    
    const results = await Promise.all(animePromises);
    const allAnime = results.flat();
    
    // If no anime data was fetched, return empty array early
    if (allAnime.length === 0) {
      console.warn('No anime data could be fetched from any endpoint');
      return [];
    }
    
    // Create a map to ensure unique IDs and filter duplicates
    const uniqueAnime = new Map();
    
    allAnime.forEach(anime => {
      const animeId = `anime-${anime.mal_id}`;
      if (!uniqueAnime.has(animeId) && anime.synopsis && anime.images?.jpg?.image_url) {
        uniqueAnime.set(animeId, {
          id: animeId,
          title: anime.title_english || anime.title,
          plot: anime.synopsis,
          poster: anime.images.jpg.image_url,
          year: anime.year?.toString() || '',
          genre: anime.genres?.map(g => g.name).join(', ') || '',
          runtime: anime.duration || '',
          rating: anime.score?.toString() || '',
          type: 'anime' as const
        });
      }
    });
    
    const animeList = Array.from(uniqueAnime.values());
    return animeList.slice(0, 8); // Return max 8 anime
  } catch (error) {
    console.warn('Error in fetchTrendingAnime:', error);
    return []; // Return empty array instead of throwing
  }
};

// Fetch popular movies from OMDb API
export const fetchPopularMovies = async (): Promise<ContentItem[]> => {
  try {
    await delay(200); // Reduced rate limiting
    
    // Search for popular movies across different years for better variety
    const searchTerms = ['action', 'drama', 'comedy', 'thriller'];
    const movies: ContentItem[] = [];
    
    for (const term of searchTerms) {
      try {
        // Search without year filter to get variety of content
        const data: OMDBMovieResponse = await makeApiRequest(`${OMDB_BASE_URL}/?s=${encodeURIComponent(term)}&type=movie&apikey=${OMDB_API_KEY}`);
        
        if (data.Response === 'True' && data.Search) {
          // Get detailed info for first 2 movies from each category
          for (const movie of data.Search.slice(0, 2)) {
            try {
              const detailData: OMDBMovieDetail = await makeApiRequest(`${OMDB_BASE_URL}/?i=${movie.imdbID}&apikey=${OMDB_API_KEY}&plot=short`);
              
              if (detailData.Response === 'True') {
                const movieItem = {
                  id: `movie-${detailData.imdbID}`,
                  title: detailData.Title,
                  plot: detailData.Plot,
                  poster: detailData.Poster !== 'N/A' ? detailData.Poster : 'https://via.placeholder.com/500x750/1A1A1A/FFFFFF?text=No+Image',
                  year: detailData.Year,
                  genre: detailData.Genre,
                  runtime: detailData.Runtime,
                  rating: detailData.imdbRating,
                  type: 'movie' as const
                };
                
                // Check if movie is not already added
                if (!movies.find(m => m.id === movieItem.id)) {
                  movies.push(movieItem);
                }
              }
              
              await delay(200); // Small delay between requests
            } catch (error) {
              console.error(`Error fetching movie details for ${movie.imdbID}:`, error);
            }
          }
        }
        
        await delay(300); // Delay between search terms
      } catch (error) {
        console.error(`Error searching for ${term} movies:`, error);
      }
    }
    
    return movies.slice(0, 8); // Return max 8 movies
  } catch (error) {
    return handleApiError(error, 'popular movies');
  }
};

// Search movies from OMDb API
export const searchMovies = async (query: string): Promise<ContentItem[]> => {
  try {
    await delay(500); // Rate limiting
    const data: OMDBMovieResponse = await makeApiRequest(`${OMDB_BASE_URL}/?s=${encodeURIComponent(query)}&type=movie&apikey=${OMDB_API_KEY}`);
    
    if (data.Response !== 'True' || !data.Search) {
      return [];
    }
    
    const movies: ContentItem[] = [];
    
    for (const movie of data.Search.slice(0, 8)) {
      try {
        // Get detailed info for each movie
        const detailData: OMDBMovieDetail = await makeApiRequest(`${OMDB_BASE_URL}/?i=${movie.imdbID}&apikey=${OMDB_API_KEY}&plot=short`);
        
        if (detailData.Response === 'True') {
          movies.push({
            id: `movie-${detailData.imdbID}`,
            title: detailData.Title,
            plot: detailData.Plot,
            poster: detailData.Poster !== 'N/A' ? detailData.Poster : 'https://via.placeholder.com/500x750/1A1A1A/FFFFFF?text=No+Image',
            year: detailData.Year,
            genre: detailData.Genre,
            runtime: detailData.Runtime,
            rating: detailData.imdbRating,
            type: 'movie' as const
          });
        }
        
        await delay(300); // Small delay between requests
      } catch (error) {
        console.error(`Error fetching movie details for ${movie.imdbID}:`, error);
      }
    }
    
    return movies;
  } catch (error) {
    return handleApiError(error, 'search movies');
  }
};

// Search anime from Jikan API
export const searchAnime = async (query: string): Promise<ContentItem[]> => {
  try {
    await delay(1000); // Rate limiting for Jikan
    const data: JikanAnimeResponse = await makeApiRequest(`${JIKAN_BASE_URL}/anime?q=${encodeURIComponent(query)}&limit=10`);
    
    // Check if the request failed
    if (!data || !data.data) {
      console.warn('Anime search API request failed');
      return [];
    }
    
    // Create a map to ensure unique IDs and filter duplicates
    const uniqueAnime = new Map();
    
    data.data.forEach(anime => {
      const animeId = `anime-${anime.mal_id}`;
      if (!uniqueAnime.has(animeId)) {
        uniqueAnime.set(animeId, {
          id: animeId,
          title: anime.title_english || anime.title,
          plot: anime.synopsis,
          poster: anime.images.jpg.image_url,
          year: anime.year?.toString() || '',
          genre: anime.genres.map(g => g.name).join(', '),
          runtime: anime.duration,
          rating: anime.score?.toString() || '',
          type: 'anime' as const
        });
      }
    });
    
    return Array.from(uniqueAnime.values());
  } catch (error) {
    console.warn('Error in searchAnime:', error);
    return []; // Return empty array instead of throwing
  }
};

// Fallback content when APIs fail
const getFallbackContent = (): ContentItem[] => {
  return [
    {
      id: 'fallback-1',
      title: 'Sample Movie',
      plot: 'A sample movie description for demonstration purposes.',
      poster: 'https://via.placeholder.com/500x750/1A1A1A/FFFFFF?text=Sample+Movie',
      year: '2024',
      genre: 'Action, Adventure',
      runtime: '120 min',
      rating: '8.5',
      type: 'movie'
    },
    {
      id: 'fallback-2',
      title: 'Sample Series',
      plot: 'A sample series description for demonstration purposes.',
      poster: 'https://via.placeholder.com/500x750/1A1A1A/FFFFFF?text=Sample+Series',
      year: '2024',
      genre: 'Drama, Thriller',
      runtime: '45 min',
      rating: '8.2',
      type: 'series'
    }
  ];
};

// Get trending content (combination of movies and anime)
export const getTrendingContent = async (): Promise<ContentItem[]> => {
  try {
    const [movies, anime] = await Promise.all([
      fetchPopularMovies(),
      fetchTrendingAnime()
    ]);
    
    // Combine and shuffle results, ensuring unique IDs
    const combined = [...movies, ...anime].filter(item => item && item.id && item.title);
    
    // If no content from APIs, return fallback content
    if (combined.length === 0) {
      console.warn('No content from APIs, using fallback content');
      return getFallbackContent();
    }
    
    return combined.sort(() => Math.random() - 0.5).slice(0, 8);
  } catch (error) {
    console.warn('Error in getTrendingContent:', error);
    return getFallbackContent();
  }
};

// Search series from OMDb API
export const searchSeries = async (query: string): Promise<ContentItem[]> => {
  try {
    await delay(500); // Rate limiting
    const data: OMDBMovieResponse = await makeApiRequest(`${OMDB_BASE_URL}/?s=${encodeURIComponent(query)}&type=series&apikey=${OMDB_API_KEY}`);
    
    if (data.Response !== 'True' || !data.Search) {
      return [];
    }
    
    const series: ContentItem[] = [];
    
    for (const show of data.Search.slice(0, 8)) {
      try {
        // Get detailed info for each series
        const detailData: OMDBMovieDetail = await makeApiRequest(`${OMDB_BASE_URL}/?i=${show.imdbID}&apikey=${OMDB_API_KEY}&plot=short`);
        
        if (detailData.Response === 'True') {
          series.push({
            id: `series-${detailData.imdbID}`,
            title: detailData.Title,
            plot: detailData.Plot,
            poster: detailData.Poster !== 'N/A' ? detailData.Poster : 'https://via.placeholder.com/500x750/1A1A1A/FFFFFF?text=No+Image',
            year: detailData.Year,
            genre: detailData.Genre,
            runtime: detailData.Runtime,
            rating: detailData.imdbRating,
            type: 'series' as const
          });
        }
        
        await delay(300); // Small delay between requests
      } catch (error) {
        console.error(`Error fetching series details for ${show.imdbID}:`, error);
      }
    }
    
    return series;
  } catch (error) {
    return handleApiError(error, 'search series');
  }
};

// Search all content types
export const searchContent = async (query: string): Promise<ContentItem[]> => {
  try {
    const [movies, anime, series] = await Promise.all([
      searchMovies(query),
      searchAnime(query),
      searchSeries(query)
    ]);
    
    return [...movies, ...anime, ...series];
  } catch (error) {
    return handleApiError(error, 'search content');
  }
};

// Get movies by category
export const getMovies = async (): Promise<ContentItem[]> => {
  return fetchPopularMovies();
};

// Get anime by category
export const getAnime = async (): Promise<ContentItem[]> => {
  return fetchTrendingAnime();
};

// Get series (using TV shows from OMDb)
export const getSeries = async (): Promise<ContentItem[]> => {
  try {
    await delay(200); // Reduced rate limiting
    
    // Search for popular TV series across different years for better variety
    const searchTerms = ['drama', 'comedy', 'action', 'sci-fi'];
    const series: ContentItem[] = [];
    
    for (const term of searchTerms) {
      try {
        // Search without year filter to get variety of content
        const data: OMDBMovieResponse = await makeApiRequest(`${OMDB_BASE_URL}/?s=${encodeURIComponent(term)}&type=series&apikey=${OMDB_API_KEY}`);
        
        if (data.Response === 'True' && data.Search) {
          // Get detailed info for first 2 series from each category
          for (const show of data.Search.slice(0, 2)) {
            try {
              const detailData: OMDBMovieDetail = await makeApiRequest(`${OMDB_BASE_URL}/?i=${show.imdbID}&apikey=${OMDB_API_KEY}&plot=short`);
              
              if (detailData.Response === 'True') {
                const seriesItem = {
                  id: `series-${detailData.imdbID}`,
                  title: detailData.Title,
                  plot: detailData.Plot,
                  poster: detailData.Poster !== 'N/A' ? detailData.Poster : 'https://via.placeholder.com/500x750/1A1A1A/FFFFFF?text=No+Image',
                  year: detailData.Year,
                  genre: detailData.Genre,
                  runtime: detailData.Runtime,
                  rating: detailData.imdbRating,
                  type: 'series' as const
                };
                
                // Check if series is not already added
                if (!series.find(s => s.id === seriesItem.id)) {
                  series.push(seriesItem);
                }
              }
              
              await delay(200); // Small delay between requests
            } catch (error) {
              console.error(`Error fetching series details for ${show.imdbID}:`, error);
            }
          }
        }
        
        await delay(300); // Delay between search terms
      } catch (error) {
        console.error(`Error searching for ${term} series:`, error);
      }
    }
    
    return series.slice(0, 8); // Return max 8 series
  } catch (error) {
    return handleApiError(error, 'series');
  }
};

// Get content by ID and type
export const getContentById = async (id: string, type: string): Promise<ContentItem> => {
  try {
    await delay(300); // Rate limiting
    
    // Extract the actual ID from the prefixed ID
    const actualId = id.replace(`${type}-`, '');
    
    if (type === 'movie' || type === 'series') {
      // Use OMDb API for movies and series
      const data: OMDBMovieDetail = await makeApiRequest(`${OMDB_BASE_URL}/?i=${actualId}&apikey=${OMDB_API_KEY}&plot=full`);
      
      if (data.Response === 'True') {
        return {
          id: `${type}-${data.imdbID}`,
          title: data.Title,
          plot: data.Plot,
          poster: data.Poster !== 'N/A' ? data.Poster : 'https://via.placeholder.com/500x750/1A1A1A/FFFFFF?text=No+Image',
          year: data.Year,
          genre: data.Genre,
          runtime: data.Runtime,
          rating: data.imdbRating,
          type: type as 'movie' | 'series',
          cast: data.Actors,
          director: data.Director
        };
      }
    } else if (type === 'anime') {
      // Use Jikan API for anime
      const data = await makeApiRequest(`${JIKAN_BASE_URL}/anime/${actualId}/full`);
      
      if (data && data.data) {
        const anime = data.data;
        return {
          id: `anime-${anime.mal_id}`,
          title: anime.title_english || anime.title,
          plot: anime.synopsis,
          poster: anime.images?.jpg?.image_url || 'https://via.placeholder.com/500x750/1A1A1A/FFFFFF?text=No+Image',
          year: anime.year?.toString() || '',
          genre: anime.genres?.map((g: any) => g.name).join(', ') || '',
          runtime: anime.duration || '',
          rating: anime.score?.toString() || '',
          type: 'anime',
          episodes: anime.episodes,
          status: anime.status,
          season: anime.season?.year ? `${anime.season.season} ${anime.season.year}` : '',
          studio: anime.studios?.[0]?.name || ''
        };
      }
    }
    
    throw new Error('Content not found');
  } catch (error) {
    console.error('Error fetching content by ID:', error);
    // Return fallback content
    return {
      id: id,
      title: 'Content Not Found',
      plot: 'This content could not be loaded. Please try again later.',
      poster: 'https://via.placeholder.com/500x750/1A1A1A/FFFFFF?text=Not+Found',
      year: '',
      genre: '',
      runtime: '',
      rating: '',
      type: type as 'movie' | 'anime' | 'series'
    };
  }
}; 