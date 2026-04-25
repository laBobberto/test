import React from 'react';

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width = '100%',
  height,
  className = '',
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
        return 'rounded-none';
      case 'rounded':
        return 'rounded-lg';
      case 'text':
      default:
        return 'rounded';
    }
  };

  const defaultHeight = variant === 'text' ? '1em' : height || '100%';

  return (
    <div
      className={`skeleton-shimmer bg-slate-700 ${getVariantClass()} ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof defaultHeight === 'number' ? `${defaultHeight}px` : defaultHeight,
      }}
    />
  );
};
