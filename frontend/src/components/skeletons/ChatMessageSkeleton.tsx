import React from 'react';
import { Skeleton } from './Skeleton';

interface ChatMessageSkeletonProps {
  count?: number;
}

export const ChatMessageSkeleton: React.FC<ChatMessageSkeletonProps> = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'} mb-4`}>
          <div className={`max-w-xs ${index % 2 === 0 ? 'bg-slate-700' : 'bg-purple-600'} rounded-lg p-3`}>
            <Skeleton variant="text" width={index % 2 === 0 ? 200 : 150} height={16} />
            <Skeleton variant="text" width={80} height={12} className="mt-2" />
          </div>
        </div>
      ))}
    </>
  );
};
