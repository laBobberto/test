import React from 'react';
import { Skeleton } from './Skeleton';

interface EventCardSkeletonProps {
  count?: number;
}

export const EventCardSkeleton: React.FC<EventCardSkeletonProps> = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="card">
          <Skeleton variant="rounded" width="100%" height={200} className="mb-4" />
          <Skeleton variant="text" width="40%" height={14} className="mb-2" />
          <Skeleton variant="text" width="90%" height={24} className="mb-2" />
          <Skeleton variant="text" width="100%" height={16} className="mb-3" />
          <div className="flex items-center gap-2 mb-3">
            <Skeleton variant="text" width={100} height={14} />
            <Skeleton variant="text" width={80} height={14} />
          </div>
          <Skeleton variant="rounded" width="100%" height={40} />
        </div>
      ))}
    </>
  );
};
