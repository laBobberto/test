import React from 'react';
import { Skeleton } from './Skeleton';

interface ProfileSkeletonProps {
  showAchievements?: boolean;
}

export const ProfileSkeleton: React.FC<ProfileSkeletonProps> = ({ showAchievements = true }) => {
  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="card">
        <div className="flex items-start gap-6 mb-6">
          <Skeleton variant="circular" width={120} height={120} />
          <div className="flex-1">
            <Skeleton variant="text" width="40%" height={32} className="mb-2" />
            <Skeleton variant="text" width="60%" height={16} className="mb-4" />
            <div className="flex gap-2">
              <Skeleton variant="rounded" width={100} height={40} />
              <Skeleton variant="rounded" width={100} height={40} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card">
            <Skeleton variant="text" width="60%" height={12} className="mb-2" />
            <Skeleton variant="text" width="40%" height={28} />
          </div>
        ))}
      </div>

      {/* Achievements */}
      {showAchievements && (
        <div className="card">
          <Skeleton variant="text" width="30%" height={24} className="mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" width="100%" height={100} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
