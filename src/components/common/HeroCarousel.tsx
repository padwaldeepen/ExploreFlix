import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Play, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ContentItem } from '@/types/content';
import styles from './HeroCarousel.module.scss';

interface HeroCarouselProps {
  items: ContentItem[];
  autoPlay?: boolean;
  interval?: number;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  items,
  autoPlay = true,
  interval = 5000
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
  }, [items.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const handleAutoPlayToggle = useCallback(() => {
    setIsAutoPlaying(!isAutoPlaying);
  }, [isAutoPlaying]);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || items.length <= 1) return;

    const timer = setInterval(goToNext, interval);
    return () => clearInterval(timer);
  }, [isAutoPlaying, interval, goToNext, items.length]);

  if (!items || items.length === 0) {
    return null;
  }

  const currentItem = items[currentIndex];

  return (
    <div className={styles.heroCarousel}>
      {/* Main Content */}
      <div className={styles.carouselContainer}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            className={styles.carouselSlide}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
          >
            <div className={styles.slideContent}>
              <div className={styles.slideImage}>
                <img
                  src={currentItem.poster}
                  alt={currentItem.title}
                  className={styles.poster}
                />
                <div className={styles.imageOverlay} />
              </div>
              
              <div className={styles.slideInfo}>
                <motion.h1
                  className={styles.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {currentItem.title}
                </motion.h1>
                
                <motion.p
                  className={styles.plot}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {currentItem.plot}
                </motion.p>
                
                <motion.div
                  className={styles.meta}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {currentItem.year && (
                    <span className={styles.year}>{currentItem.year}</span>
                  )}
                  {currentItem.genre && (
                    <span className={styles.genre}>{currentItem.genre}</span>
                  )}
                  {currentItem.rating && (
                    <div className={styles.rating}>
                      <Star size={16} fill="currentColor" />
                      <span>{currentItem.rating}</span>
                    </div>
                  )}
                </motion.div>
                
                <motion.div
                  className={styles.actions}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Link
                    to={`/details/${currentItem.type}/${currentItem.id}`}
                    className={styles.watchButton}
                  >
                    <Play size={20} />
                    View Details
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className={styles.navigation}>
        <button
          className={styles.navButton}
          onClick={goToNext}
          aria-label="Next slide"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Indicators */}
      {items.length > 1 && (
        <div className={styles.indicators}>
          {items.map((_, index) => (
            <button
              key={index}
              className={`${styles.indicator} ${index === currentIndex ? styles.active : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Auto-play toggle */}
      {items.length > 1 && (
        <button
          className={styles.autoPlayToggle}
          onClick={handleAutoPlayToggle}
          aria-label={isAutoPlaying ? 'Pause auto-play' : 'Start auto-play'}
        >
          {isAutoPlaying ? '⏸️' : '▶️'}
        </button>
      )}
    </div>
  );
}; 