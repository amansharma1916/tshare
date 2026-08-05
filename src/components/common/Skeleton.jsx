import React from 'react';
import './Skeleton.css';

// Base skeleton component
export const Skeleton = ({ className = '', style = {} }) => (
  <div className={`skeleton ${className}`} style={style} />
);

// Text line skeleton
export const SkeletonText = ({ lines = 3, className = '' }) => (
  <div className={`skeleton-text ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} className="skeleton-text__line" style={{ width: i === lines - 1 ? '60%' : '100%' }} />
    ))}
  </div>
);

// Card skeleton
export const SkeletonCard = ({ className = '' }) => (
  <div className={`skeleton-card ${className}`}>
    <Skeleton className="skeleton-card__icon" />
    <div className="skeleton-card__content">
      <Skeleton className="skeleton-card__title" />
      <Skeleton className="skeleton-card__value" />
    </div>
  </div>
);

// Chart/Bar skeleton
export const SkeletonChart = ({ bars = 5, className = '' }) => (
  <div className={`skeleton-chart ${className}`}>
    {Array.from({ length: bars }).map((_, i) => (
      <div key={i} className="skeleton-chart__bar-group">
        <Skeleton className="skeleton-chart__label" />
        <Skeleton className="skeleton-chart__bar" />
      </div>
    ))}
  </div>
);

// History item skeleton
export const SkeletonHistoryItem = ({ className = '' }) => (
  <div className={`skeleton-history-item ${className}`}>
    <Skeleton className="skeleton-history-item__icon" />
    <div className="skeleton-history-item__content">
      <Skeleton className="skeleton-history-item__title" />
      <Skeleton className="skeleton-history-item__subtitle" />
    </div>
    <Skeleton className="skeleton-history-item__time" />
  </div>
);

// Image skeleton
export const SkeletonImage = ({ className = '' }) => (
  <div className={`skeleton-image ${className}`}>
    <Skeleton className="skeleton-image__img" />
  </div>
);

// Dashboard skeleton (combines multiple components)
export const DashboardSkeleton = () => (
  <div className="dashboard-skeleton">
    {/* Welcome header skeleton */}
    <div className="dashboard-skeleton__header">
      <Skeleton className="skeleton-header__avatar" />
      <div className="skeleton-header__text">
        <Skeleton className="skeleton-header__title" />
        <Skeleton className="skeleton-header__subtitle" />
      </div>
    </div>

    {/* Premium banner skeleton */}
    <Skeleton className="skeleton-banner" />

    {/* Summary cards skeleton */}
    <div className="dashboard-skeleton__cards">
      {Array.from({ length: 5 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>

    {/* Charts skeleton */}
    <div className="dashboard-skeleton__charts">
      <div className="dashboard-skeleton__chart">
        <Skeleton className="skeleton-chart__title" />
        <SkeletonChart bars={3} />
      </div>
      <div className="dashboard-skeleton__chart">
        <Skeleton className="skeleton-chart__title" />
        <div className="skeleton-line-chart">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="skeleton-line-chart__bar" />
          ))}
        </div>
      </div>
    </div>

    {/* History section skeleton */}
    <div className="dashboard-skeleton__history">
      <div className="skeleton-history__header">
        <div>
          <Skeleton className="skeleton-history__title" />
          <Skeleton className="skeleton-history__desc" />
        </div>
        <Skeleton className="skeleton-history__count" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <SkeletonHistoryItem key={i} />
      ))}
    </div>
  </div>
);

// Page content skeleton (generic)
export const PageSkeleton = ({ type = 'default' }) => {
  if (type === 'dashboard') {
    return <DashboardSkeleton />;
  }

  return (
    <div className="page-skeleton">
      <div className="page-skeleton__header">
        <Skeleton className="page-skeleton__title" />
        <Skeleton className="page-skeleton__desc" />
      </div>
      <SkeletonText lines={4} />
    </div>
  );
};