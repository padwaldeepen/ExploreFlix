import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { HeroCarousel } from '../components/common/HeroCarousel';
import { ContentCard } from '../components/content/ContentCard';
import { CategoryNav } from '../components/common/CategoryNav';
import { useExploreFlix } from '../hooks/useExploreFlix';
import { ContentItem } from '@/types/content';
import styles from './Home.module.scss';
import { LoaderOverlay } from '../components/common/LoaderOverlay';
import { Link } from 'react-router-dom';

export const Home = () => {
  const { trendingContent, isLoading, error, getContentByCategory, getEditorPicks, getRecentlyAdded } = useExploreFlix();
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Memoized content by category
  const currentCategoryContent = useMemo(() => {
    return getContentByCategory(selectedCategory);
  }, [getContentByCategory, selectedCategory]);

  // Memoized editor picks
  const editorPicksContent = useMemo(() => {
    return getEditorPicks();
  }, [getEditorPicks]);

  // Memoized recently added
  const recentlyAddedContent = useMemo(() => {
    return getRecentlyAdded();
  }, [getRecentlyAdded]);

  // Memoized hero content (first 5 items)
  const heroContent = useMemo(() => {
    return trendingContent.slice(0, 5);
  }, [trendingContent]);

  // Callback for category change
  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const
      }
    }
  };

  if (isLoading) {
    return <LoaderOverlay />;
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Oops! Something went wrong</h2>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className={styles.retryButton}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={styles.home}>
      {/* Hero Carousel */}
      {heroContent.length > 0 && (
        <motion.section
          className={styles.heroSection}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <HeroCarousel items={heroContent} />
        </motion.section>
      )}

      {/* Category Navigation */}
      <motion.section
        className={styles.categorySection}
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className={styles.container}>
          <CategoryNav
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />
        </div>
      </motion.section>

      {/* Trending Now */}
      <motion.section
        className={styles.contentSection}
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className={styles.container}>
          <motion.div
            className={styles.sectionHeader}
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className={styles.sectionTitle}>
              <span className={styles.titleAccent}>Trending</span> Now
            </h2>
            <p className={styles.sectionSubtitle}>
              Discover what's hot and happening in entertainment
            </p>
          </motion.div>

          <motion.div
            className={styles.contentGrid}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {currentCategoryContent.length > 0 ? (
              currentCategoryContent
                .slice(0, 12)
                .filter(item => item && item.id && item.title)
                .map((item: ContentItem, index: number) => (
                  <motion.div
                    key={item.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ContentCard item={item} variant="default" />
                  </motion.div>
                ))
            ) : (
              <div className={styles.emptySection}>
                <p>No content available for this category.</p>
              </div>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* Editor's Picks */}
      <motion.section
        className={styles.contentSection}
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className={styles.container}>
          <motion.div
            className={styles.sectionHeader}
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className={styles.sectionTitle}>
              <span className={styles.titleAccent}>Editor's</span> Picks
            </h2>
            <p className={styles.sectionSubtitle}>
              Curated selections from our entertainment experts
            </p>
          </motion.div>

          <motion.div
            className={styles.contentGrid}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {editorPicksContent.length > 0 ? (
              editorPicksContent
                .filter(item => item && item.id && item.title)
                .map((item: ContentItem, index: number) => (
                  <motion.div
                    key={item.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ContentCard item={item} variant="featured" />
                  </motion.div>
                ))
            ) : (
              <div className={styles.emptySection}>
                <p>No editor picks available at the moment.</p>
              </div>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* Recently Added */}
      <motion.section
        className={styles.contentSection}
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className={styles.container}>
          <motion.div
            className={styles.sectionHeader}
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className={styles.sectionTitle}>
              <span className={styles.titleAccent}>Recently</span> Added
            </h2>
            <p className={styles.sectionSubtitle}>
              Fresh content just added to our collection
            </p>
          </motion.div>

          <motion.div
            className={styles.contentGrid}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {recentlyAddedContent.length > 0 ? (
              recentlyAddedContent
                .filter(item => item && item.id && item.title)
                .map((item: ContentItem, index: number) => (
                  <motion.div
                    key={item.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ContentCard item={item} variant="compact" />
                  </motion.div>
                ))
            ) : (
              <div className={styles.emptySection}>
                <p>No recently added content available.</p>
              </div>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* Call to Action */}
      <motion.section
        className={styles.ctaSection}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <motion.h2
              className={styles.ctaTitle}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Ready to Start Exploring?
            </motion.h2>
            <motion.p
              className={styles.ctaSubtitle}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Discover thousands of movies, anime, and series waiting for you
            </motion.p>
            <Link
              to="/browse/movies"
              className={styles.ctaButton}
            >
              Start Exploring
            </Link>
          </div>
        </div>
      </motion.section>
    </div>
  );
}; 