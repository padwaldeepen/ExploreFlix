import { Film, Tv, Zap } from 'lucide-react';
import styles from './CategoryNav.module.scss';

interface CategoryNavProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { id: 'all', label: 'All', icon: Zap },
  { id: 'movie', label: 'Movies', icon: Film },
  { id: 'anime', label: 'Anime', icon: Tv },
  { id: 'series', label: 'Series', icon: Tv },
];

export const CategoryNav: React.FC<CategoryNavProps> = ({
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <nav className={styles.categoryNav}>
      <div className={styles.navList}>
        {categories.map((category) => {
          const IconComponent = category.icon;
          const isActive = selectedCategory === category.id;
          return (
            <button
              key={category.id}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              onClick={() => onCategoryChange(category.id)}
              type="button"
            >
              <span className={styles.iconContainer}>
                <IconComponent size={28} />
              </span>
              <span className={styles.label}>{category.label}</span>
              {isActive && (
                <span className={styles.activeIndicator} />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}; 