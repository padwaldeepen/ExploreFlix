import React from 'react';
import styles from './LoaderOverlay.module.scss';

export const LoaderOverlay: React.FC = () => (
  <div className={styles.loaderOverlay}>
    <div className={styles.loaderSpinner}>
      <div className={styles.loaderDot}></div>
      <div className={styles.loaderDot}></div>
      <div className={styles.loaderDot}></div>
      <div className={styles.loaderDot}></div>
    </div>
    <div className={styles.loaderText}>Loading ExploreFlix...</div>
  </div>
); 