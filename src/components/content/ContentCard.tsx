import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Play, Star } from 'lucide-react';
import { ContentItem } from '@/types/content';
import styles from './ContentCard.module.scss';

interface ContentCardProps {
  item: ContentItem;
  variant?: 'default' | 'featured' | 'compact';
}

export const ContentCard = React.memo<ContentCardProps>(({ 
  item, 
  variant = 'default' 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Early return if item is undefined or missing required properties
  if (!item || !item.id || !item.title) {
    console.warn('ContentCard: Invalid item prop', item);
    return null;
  }

  const handlePlayClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Navigate to details page
    window.location.href = `/details/${item.type}/${item.id}`;
  }, [item.type, item.id]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    try {
      e.currentTarget.src = 'https://via.placeholder.com/500x750/1A1A1A/FFFFFF?text=No+Image';
    } catch (error) {
      console.error('Error handling image error:', error);
    }
  }, []);

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    hover: { 
      y: -8,
      transition: { duration: 0.3, ease: "easeOut" as const }
    }
  };

  const imageVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05 }
  };

  const overlayVariants = {
    initial: { opacity: 0 },
    hover: { opacity: 1 }
  };

  const contentVariants = {
    initial: { y: 0 },
    hover: { y: -10 }
  };

  // Safe fallback values
  const safePoster = item.poster || 'https://via.placeholder.com/500x750/1A1A1A/FFFFFF?text=No+Image';
  const safeTitle = item.title || 'Unknown Title';
  const safeType = item.type || 'unknown';

  return (
    <motion.div
      className={`${styles.contentCard} ${styles[variant]}`}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      layout
    >
      <Link to={`/details/${safeType}/${item.id}`} className={styles.cardLink}>
        {/* Image Container */}
        <div className={styles.imageContainer}>
          <motion.img
            src={safePoster}
            alt={safeTitle}
            className={styles.poster}
            variants={imageVariants}
            loading="lazy"
            onError={handleImageError}
          />
          
          {/* Gradient Overlay */}
          <div className={styles.gradientOverlay} />
          
          {/* Hover Overlay */}
          <motion.div
            className={styles.hoverOverlay}
            variants={overlayVariants}
          >
            <div className={styles.overlayContent}>
              <motion.button
                className={styles.playButton}
                onClick={handlePlayClick}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Watch trailer"
                title="Watch trailer"
              >
                <Play size={24} />
              </motion.button>
            </div>
          </motion.div>

          {/* Badge */}
          <div className={styles.badge}>
            {safeType}
          </div>

          {/* Rating */}
          {item.rating && (
            <div className={styles.rating}>
              <Star size={14} fill="currentColor" />
              <span>{item.rating}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <motion.div
          className={styles.content}
          variants={contentVariants}
        >
          <h3 className={styles.title}>{safeTitle}</h3>
          
          <div className={styles.meta}>
            {item.year && (
              <span className={styles.year}>{item.year}</span>
            )}
            {item.genre && (
              <span className={styles.genre}>{item.genre}</span>
            )}
            {item.runtime && (
              <span className={styles.runtime}>{item.runtime}</span>
            )}
          </div>

          {variant === 'featured' && item.plot && (
            <p className={styles.plot}>
              {item.plot.length > 120 
                ? `${item.plot.substring(0, 120)}...` 
                : item.plot
              }
            </p>
          )}
        </motion.div>

        {/* Glow Effect */}
        <motion.div
          className={styles.glowEffect}
          animate={{
            opacity: isHovered ? 1 : 0,
            scale: isHovered ? 1.1 : 1,
          }}
          transition={{ duration: 0.3 }}
        />
      </Link>

      {/* Animated Border */}
      <motion.div
        className={styles.animatedBorder}
        animate={{
          opacity: isHovered ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
});

ContentCard.displayName = 'ContentCard'; 