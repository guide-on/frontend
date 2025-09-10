import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  className?: string;
  type?: 'spinner' | 'dots' | 'pulse';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = '#3b82f6', 
  className = '',
  type = 'spinner'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const dotSizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-1.5 h-1.5', 
    lg: 'w-2 h-2',
    xl: 'w-3 h-3'
  };

  if (type === 'dots') {
    return (
      <div className={`inline-flex items-center justify-center space-x-1 ${className}`}>
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className={`rounded-full animate-bounce ${dotSizeClasses[size]}`}
            style={{ 
              backgroundColor: color,
              animationDelay: `${index * 0.2}s`,
              animationDuration: '0.8s'
            }}
          />
        ))}
      </div>
    );
  }

  if (type === 'pulse') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <div 
          className={`animate-pulse rounded-full ${sizeClasses[size]}`}
          style={{ backgroundColor: color }}
        />
      </div>
    );
  }

  // Default spinner
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <div 
        className={`animate-spin rounded-full border-2 border-t-transparent ${sizeClasses[size]}`}
        style={{ 
          borderColor: `${color}33`,
          borderTopColor: color 
        }}
      />
    </div>
  );
};

export default LoadingSpinner;