import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoaderOverlay } from '@/components/common/LoaderOverlay';

// Lazy load all pages for code splitting
const Home = lazy(() => import('@/pages/Home').then(module => ({ default: module.Home })));
const Movies = lazy(() => import('@/pages/Movies').then(module => ({ default: module.Movies })));
const Series = lazy(() => import('@/pages/Series').then(module => ({ default: module.Series })));
const Anime = lazy(() => import('@/pages/Anime').then(module => ({ default: module.Anime })));
const Search = lazy(() => import('@/pages/Search').then(module => ({ default: module.Search })));
const Details = lazy(() => import('@/pages/Details').then(module => ({ default: module.Details })));
const NotFound = lazy(() => import('@/pages/NotFound').then(module => ({ default: module.NotFound })));

// Loading component for Suspense fallback
const PageLoader = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '50vh',
    color: '#fff'
  }}>
    <LoaderOverlay />
  </div>
);

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/series" element={<Series />} />
        <Route path="/anime" element={<Anime />} />
        <Route path="/search" element={<Search />} />
        <Route path="/details/:type/:id" element={<Details />} />
        {/* Redirects for legacy /browse/* routes */}
        <Route path="/browse/movies" element={<Navigate to="/movies" replace />} />
        <Route path="/browse/anime" element={<Navigate to="/anime" replace />} />
        <Route path="/browse/series" element={<Navigate to="/series" replace />} />
        {/* Catch-all 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}; 