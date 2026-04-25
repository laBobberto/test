import React from 'react';
import { Skeleton } from './Skeleton';

interface ActivityCardSkeletonProps {
  count?: number;
}

export const ActivityCardSkeleton: React.FC<ActivityCardSkeletonProps> = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-slate-800 rounded-lg p-4 border-l-4 border-gray-500">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="rounded" width={40} height={24} />
              </div>
              
              <Skeleton variant="text" width="80%" height={16} className="mb-2" />
              
              <div className="flex items-center gap-4">
                <Skeleton variant="text" width={100} height={14} />
                <Skeleton variant="text" width={120} height={14} />
                <Skeleton variant="text" width={80} height={14} />
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="circular" width={40} height={40} />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};
