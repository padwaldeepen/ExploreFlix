import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { ContentCard } from '../components/content/ContentCard';
import { ContentItem } from '../types/content';
import { getSeries } from '../api/exploreflixApi';
import styles from './Movies.module.scss'; // Reusing Movies styles
import { LoaderOverlay } from '../components/common/LoaderOverlay';

export const Series = () => {
  const [series, setSeries] = useState<ContentItem[]>([]);
  const [filteredSeries, setFilteredSeries] = useState<ContentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSeries = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const seriesData = await getSeries();
        setSeries(seriesData);
        setFilteredSeries(seriesData);
      } catch (err) {
        setError('Failed to load series');
        console.error('Error loading series:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSeries();
  }, []);

  useEffect(() => {
    filterAndSortSeries();
  }, [series, searchQuery, selectedGenre, selectedYear, sortBy]);

  const filterAndSortSeries = () => {
    let filtered = [...series];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.plot && item.plot.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply genre filter
    if (selectedGenre !== 'all') {
      filtered = filtered.filter(item =>
        item.genre?.toLowerCase().includes(selectedGenre.toLowerCase())
      );
    }

    // Apply year filter
    if (selectedYear !== 'all') {
      filtered = filtered.filter(item => item.year === selectedYear);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'year':
          return (b.year || '').localeCompare(a.year || '');
        case 'rating':
          return parseFloat(b.rating || '0') - parseFloat(a.rating || '0');
        default:
          return 0;
      }
    });

    setFilteredSeries(filtered);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const getAvailableGenres = () => {
    const genres = new Set<string>();
    series.forEach(item => {
      if (item.genre) {
        item.genre.split(', ').forEach(g => genres.add(g));
      }
    });
    return Array.from(genres).sort();
  };

  const getAvailableYears = () => {
    const years = new Set(series.map(item => item.year).filter(Boolean));
    return Array.from(years).sort((a, b) => (b || '').localeCompare(a || ''));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return <LoaderOverlay />;
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h3>Error loading series</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
        <p style={{marginTop: '1rem', color: '#aaa'}}>If this keeps happening, our series API may be down. Please try again later or check your connection.</p>
      </div>
    );
  }

  return (
    <div className={styles.moviesPage}>
      <div className={styles.container}>
        {/* Header */}
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className={styles.headerContent}>
            <h1 className={styles.pageTitle}>
              <span className={styles.titleAccent}>Series</span> Collection
            </h1>
            <p className={styles.pageSubtitle}>
              Discover the best TV series from around the world
            </p>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          className={styles.controls}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className={styles.searchContainer}>
            <Search className={styles.searchIcon} size={20} />
            <input
              type="text"
              placeholder="Search series..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filters}>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Genres</option>
              {getAvailableGenres().map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Years</option>
              {getAvailableYears().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="title">Sort by Title</option>
              <option value="year">Sort by Year</option>
              <option value="rating">Sort by Rating</option>
            </select>
          </div>
        </motion.div>

        {/* Results */}
        <motion.div
          className={styles.results}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className={styles.resultsHeader}>
            <h2 className={styles.resultsTitle}>
              {filteredSeries.length} {filteredSeries.length === 1 ? 'Series' : 'Series'} Found
            </h2>
            {searchQuery && (
              <p className={styles.searchQuery}>
                Showing results for "{searchQuery}"
              </p>
            )}
          </div>

          {filteredSeries.length > 0 ? (
            <div className={styles.moviesGrid}>
              {filteredSeries.map((item, index) => (
                <motion.div
                  key={`${item.id}-${index}`}
                  variants={itemVariants}
                  transition={{ delay: index * 0.1 }}
                >
                  <ContentCard item={item} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className={styles.noResults}>
              <h3>No series found</h3>
              <p>Try adjusting your search terms or filters</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}; 