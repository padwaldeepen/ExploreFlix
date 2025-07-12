import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, Filter, X, TrendingUp, Clock } from 'lucide-react';
import { ContentCard } from '../components/content/ContentCard';
import { useExploreFlix } from '../hooks/useExploreFlix';
import { useDebounce } from '../hooks/useDebounce';
import { ContentItem } from '../types/content';
import styles from './Search.module.scss';
import { LoaderOverlay } from '../components/common/LoaderOverlay';

export const Search = () => {
  const { trendingContent, searchContent } = useExploreFlix();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ContentItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    genre: '',
    year: '',
    rating: '',
  });
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearch = useCallback((query: string) => {
    if (!query.trim()) return;
    
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  }, [recentSearches]);

  // Perform search
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    try {
      const results = await searchContent(query);
      setSearchResults(results);
      saveRecentSearch(query);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchContent, saveRecentSearch]);

  // Handle search input with debouncing
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (query.trim()) {
      // Debounce search to prevent rapid API calls
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(query);
      }, 500); // Wait 500ms after user stops typing
    } else {
      setSearchResults([]);
    }
  };

  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  // Apply filters
  const applyFilters = () => {
    if (!searchQuery.trim()) return;
    
    let filtered = searchResults;
    
    if (filters.type) {
      filtered = filtered.filter(item => item.type === filters.type);
    }
    
    if (filters.genre) {
      filtered = filtered.filter(item => 
        item.genre?.toLowerCase().includes(filters.genre.toLowerCase())
      );
    }
    
    if (filters.year) {
      filtered = filtered.filter(item => item.year === filters.year);
    }
    
    if (filters.rating) {
      filtered = filtered.filter(item => {
        const itemRating = parseFloat(item.rating || '0');
        return itemRating >= parseFloat(filters.rating);
      });
    }
    
    setSearchResults(filtered);
    setShowFilters(false);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      type: '',
      genre: '',
      year: '',
      rating: '',
    });
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    }
  };

  // Get unique years from search results
  const getAvailableYears = () => {
    const years = new Set(searchResults.map(item => item.year).filter(Boolean));
    return Array.from(years).sort((a, b) => (b || '').localeCompare(a || ''));
  };

  // Get unique genres from search results
  const getAvailableGenres = () => {
    const genres = new Set<string>();
    searchResults.forEach(item => {
      if (item.genre) {
        item.genre.split(', ').forEach(genre => genres.add(genre.trim()));
      }
    });
    return Array.from(genres).sort();
  };

  // Perform search when debounced query changes
  useEffect(() => {
    performSearch(debouncedSearchQuery);
  }, [debouncedSearchQuery, performSearch]);

  return (
    <div className={styles.search}>
      {/* Search Header */}
      <motion.div 
        className={styles.searchHeader}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.searchContainer}>
          <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
            <div className={styles.searchInputWrapper}>
              <SearchIcon className={styles.searchIcon} size={20} />
              <input
                type="text"
                placeholder="Search for movies, series, anime..."
                value={searchQuery}
                onChange={handleSearchChange}
                className={styles.searchInput}
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className={styles.clearButton}
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={styles.filterButton}
              aria-label="Toggle filters"
            >
              <Filter size={20} />
            </button>
          </form>
        </div>
      </motion.div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            className={styles.filtersContainer}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className={styles.filters}>
              <div className={styles.filterGroup}>
                <label>Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="">All Types</option>
                  <option value="movie">Movies</option>
                  <option value="series">Series</option>
                  <option value="anime">Anime</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label>Genre</label>
                <select
                  value={filters.genre}
                  onChange={(e) => setFilters(prev => ({ ...prev, genre: e.target.value }))}
                >
                  <option value="">All Genres</option>
                  {getAvailableGenres().map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label>Year</label>
                <select
                  value={filters.year}
                  onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
                >
                  <option value="">All Years</option>
                  {getAvailableYears().map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label>Min Rating</label>
                <select
                  value={filters.rating}
                  onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
                >
                  <option value="">Any Rating</option>
                  <option value="7">7+</option>
                  <option value="8">8+</option>
                  <option value="9">9+</option>
                </select>
              </div>

              <div className={styles.filterActions}>
                <button onClick={applyFilters} className={styles.applyButton}>
                  Apply Filters
                </button>
                <button onClick={clearFilters} className={styles.clearFiltersButton}>
                  Clear All
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Results */}
      <div className={styles.searchResults}>
        {isSearching && (
          <div className={styles.loadingContainer}>
            <LoaderOverlay />
          </div>
        )}

        {!isSearching && searchQuery && (
          <>
            {searchResults.length > 0 ? (
              <motion.div
                className={styles.resultsContainer}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className={styles.resultsTitle}>
                  Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
                </h2>
                <div className={styles.resultsGrid}>
                  {searchResults.map((item: ContentItem, index: number) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <ContentCard item={item} variant="default" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                className={styles.noResults}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <h2>No results found</h2>
                <p>Try searching for something else or check your spelling.</p>
              </motion.div>
            )}
          </>
        )}

        {/* Recent Searches */}
        {!searchQuery && recentSearches.length > 0 && (
          <motion.div
            className={styles.recentSearches}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className={styles.recentTitle}>
              <Clock size={20} />
              Recent Searches
            </h3>
            <div className={styles.recentList}>
              {recentSearches.map((search, index) => (
                <motion.button
                  key={search}
                  className={styles.recentItem}
                  onClick={() => {
                    setSearchQuery(search);
                    performSearch(search);
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <TrendingUp size={16} />
                  {search}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Trending Content */}
        {!searchQuery && !isSearching && (
          <motion.div
            className={styles.trendingSection}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className={styles.trendingTitle}>Trending Now</h3>
            <div className={styles.trendingGrid}>
              {trendingContent.slice(0, 8).map((item: ContentItem, index: number) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ContentCard item={item} variant="compact" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}; 