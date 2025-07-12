import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Star, Film, X, Youtube, Calendar, Clock, Users, Award, Heart, Share2 } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import { ContentItem } from '@/types/content';
import { getContentById } from '@/api/exploreflixApi';
import { LoaderOverlay } from '@/components/common/LoaderOverlay';
import styles from './Details.module.scss';

export const Details: React.FC = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const [content, setContent] = useState<ContentItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      if (!id || !type) {
        setError('Invalid content ID or type');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const contentData = await getContentById(id, type);
        setContent(contentData);
      } catch (err) {
        console.error('Error fetching content:', err);
        setError('Failed to load content details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [id, type]);

  const handleWatchNow = () => {
    setShowTrailer(true);
  };

  const closeTrailer = () => {
    setShowTrailer(false);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: content?.title || 'Check out this content',
        text: content?.plot || 'Amazing content on ExploreFlix',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // You could add a toast notification here
    }
  };

  if (isLoading) {
    return <LoaderOverlay />;
  }

  if (error || !content) {
    return (
      <div className={styles.errorContainer}>
        <h2>Oops! Something went wrong</h2>
        <p>{error || 'Content not found'}</p>
        <Link to="/" className={styles.retryButton}>
          <ArrowLeft size={20} />
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.detailsPage}>
      {/* Hero Section with Background */}
      <div 
        className={styles.heroSection}
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.9)), url(${content.poster})`
        }}
      >
        <div className={styles.container}>
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className={styles.backButton}
          >
            <Link to="/" className={styles.backLink}>
              <ArrowLeft size={20} />
              Back to Home
            </Link>
          </motion.div>

          {/* Content Details */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={styles.contentDetails}
          >
            <div className={styles.posterSection}>
              <img 
                src={content.poster} 
                alt={content.title}
                className={styles.poster}
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/400x600/1A1A1A/FFFFFF?text=No+Image';
                }}
              />
            </div>

            <div className={styles.infoSection}>
              {/* Badge */}
              <div className={styles.badge}>
                {content.type}
              </div>

              {/* Title */}
              <h1 className={styles.title}>{content.title}</h1>

              {/* Meta Info */}
              <div className={styles.metaInfo}>
                {content.year && (
                  <div className={styles.metaItem}>
                    <Calendar size={16} />
                    <span>{content.year}</span>
                  </div>
                )}
                {content.rating && (
                  <div className={styles.metaItem}>
                    <Star size={16} fill="currentColor" />
                    <span>{content.rating}</span>
                  </div>
                )}
                {content.genre && (
                  <div className={styles.metaItem}>
                    <Film size={16} />
                    <span>{content.genre}</span>
                  </div>
                )}
              </div>

              {/* Plot */}
              {content.plot && (
                <p className={styles.plot}>{content.plot}</p>
              )}

              {/* Additional Details */}
              <div className={styles.additionalDetails}>
                {content.cast && (
                  <div className={styles.detailItem}>
                    <Users size={16} />
                    <span><strong>Cast:</strong> {content.cast}</span>
                  </div>
                )}
                {content.director && (
                  <div className={styles.detailItem}>
                    <Award size={16} />
                    <span><strong>Director:</strong> {content.director}</span>
                  </div>
                )}
                {content.runtime && (
                  <div className={styles.detailItem}>
                    <Clock size={16} />
                    <span><strong>Runtime:</strong> {content.runtime}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className={styles.actionButtons}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleWatchNow}
                  className={styles.watchButton}
                >
                  <Play size={20} />
                  Watch Trailer
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleFavorite}
                  className={`${styles.favoriteButton} ${isFavorite ? styles.active : ''}`}
                >
                  <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
                  {isFavorite ? 'Favorited' : 'Add to Favorites'}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShare}
                  className={styles.shareButton}
                >
                  <Share2 size={20} />
                  Share
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Trailer Modal */}
      <AnimatePresence>
        {showTrailer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.modalOverlay}
            onClick={closeTrailer}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className={styles.modalHeader}>
                <h3>Trailer - {content.title}</h3>
                <button
                  onClick={closeTrailer}
                  className={styles.closeButton}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Video Placeholder */}
              <div className={styles.videoPlaceholder}>
                <div className={styles.videoContent}>
                  <Youtube size={48} />
                  <p>Trailer for {content.title}</p>
                  <p className={styles.videoNote}>
                    In a real implementation, this would show the actual trailer video.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Details; 