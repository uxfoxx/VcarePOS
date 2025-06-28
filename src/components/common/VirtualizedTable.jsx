import React, { useMemo, useCallback } from 'react';
import { Table } from 'antd';
import { useVirtualization } from '../../hooks/useVirtualization';

export function VirtualizedTable({ 
  dataSource, 
  columns, 
  rowHeight = 54,
  containerHeight = 400,
  ...props 
}) {
  const { visibleItems, handleScroll, totalHeight } = useVirtualization(
    dataSource, 
    rowHeight, 
    containerHeight
  );

  const virtualizedDataSource = useMemo(() => {
    return visibleItems.items.map((item, index) => ({
      ...item,
      virtualIndex: visibleItems.startIndex + index
    }));
  }, [visibleItems]);

  const scrollProps = useMemo(() => ({
    y: containerHeight,
    scrollToFirstRowOnChange: false
  }), [containerHeight]);

  const components = useMemo(() => ({
    body: {
      wrapper: ({ children, ...restProps }) => (
        <div
          {...restProps}
          style={{
            height: totalHeight,
            position: 'relative'
          }}
          onScroll={handleScroll}
        >
          <div
            style={{
              transform: `translateY(${visibleItems.offsetY}px)`,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0
            }}
          >
            {children}
          </div>
        </div>
      )
    }
  }), [totalHeight, handleScroll, visibleItems.offsetY]);

  return (
    <Table
      {...props}
      dataSource={virtualizedDataSource}
      columns={columns}
      scroll={scrollProps}
      components={components}
      pagination={false}
    />
  );
}