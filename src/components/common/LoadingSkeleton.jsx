import React from 'react';
import { Skeleton, Card, Space } from 'antd';

export function LoadingSkeleton({ 
  type = 'default',
  rows = 4,
  loading = true,
  children,
  className = ''
}) {
  if (!loading) return children;

  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <Card className={className}>
            <Skeleton active avatar paragraph={{ rows: 2 }} />
          </Card>
        );
      
      case 'list':
        return (
          <div className={`space-y-4 ${className}`}>
            {Array.from({ length: rows }, (_, index) => (
              <Card key={index} size="small">
                <Skeleton active avatar paragraph={{ rows: 1 }} />
              </Card>
            ))}
          </div>
        );
      
      case 'table':
        return (
          <Card className={className}>
            <Skeleton active title paragraph={{ rows: 8 }} />
          </Card>
        );
      
      case 'form':
        return (
          <div className={`space-y-4 ${className}`}>
            <Skeleton.Input active size="large" block />
            <Skeleton.Input active size="large" block />
            <Skeleton.Input active size="large" block />
            <Skeleton active paragraph={{ rows: 2 }} />
          </div>
        );
      
      case 'product-grid':
        return (
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`}>
            {Array.from({ length: 8 }, (_, index) => (
              <Card key={index}>
                <Skeleton.Image active className="w-full h-48" />
                <div className="mt-4">
                  <Skeleton active paragraph={{ rows: 2 }} />
                </div>
              </Card>
            ))}
          </div>
        );
      
      case 'stats':
        return (
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
            {Array.from({ length: 4 }, (_, index) => (
              <Card key={index} className="text-center">
                <Skeleton.Avatar active size={64} shape="circle" />
                <div className="mt-4">
                  <Skeleton active paragraph={{ rows: 1 }} />
                </div>
              </Card>
            ))}
          </div>
        );
      
      default:
        return (
          <div className={className}>
            <Skeleton active paragraph={{ rows }} />
          </div>
        );
    }
  };

  return renderSkeleton();
}