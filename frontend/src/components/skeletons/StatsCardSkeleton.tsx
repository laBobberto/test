import React from 'react';
import { Skeleton } from './Skeleton';

interface StatsCardSkeletonProps {
  count?: number;
}

export const StatsCardSkeleton: React.FC<StatsCardSkeletonProps> = ({ count = 4 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="card">
          <div className="flex items-start justify-between mb-3">
            <Skeleton variant="text" width={80} height={12} />
            <Skeleton variant="text" width={32} height={32} />
          </div>
          <Skeleton variant="text" width="60%" height={40} />
        </div>
      ))}
    </>
  );
};
