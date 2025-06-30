import React, { useState, useEffect } from 'react';
import { Card, Typography, Statistic, Row, Col, Button, Space, Progress, Divider } from 'antd';
import { Icon } from './Icon';
import { getCacheStats, flushCache } from '../../utils/cache';
import { clearCache } from '../../utils/httpCache';

const { Title, Text } = Typography;

export function CacheStats() {
  const [stats, setStats] = useState({
    keys: 0,
    hits: 0,
    misses: 0,
    ksize: 0,
    vsize: 0
  });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Update stats every second
    const interval = setInterval(() => {
      setStats(getCacheStats());
    }, 1000);
    
    return () => clearInterval(interval);
  }, [refreshKey]);

  const handleClearMemoryCache = () => {
    flushCache();
    setRefreshKey(prev => prev + 1);
  };

  const handleClearHttpCache = async () => {
    await clearCache();
    setRefreshKey(prev => prev + 1);
  };

  const handleClearAllCaches = async () => {
    flushCache();
    await clearCache();
    setRefreshKey(prev => prev + 1);
  };

  // Calculate hit rate
  const totalRequests = stats.hits + stats.misses;
  const hitRate = totalRequests > 0 ? (stats.hits / totalRequests) * 100 : 0;

  return (
    <Card title={
      <Space>
        <Icon name="memory" className="text-blue-600" />
        <span>Cache Statistics</span>
      </Space>
    }>
      <Row gutter={16}>
        <Col span={6}>
          <Statistic 
            title="Cached Items" 
            value={stats.keys} 
            prefix={<Icon name="storage" className="mr-1 text-blue-600" />} 
          />
        </Col>
        <Col span={6}>
          <Statistic 
            title="Cache Hits" 
            value={stats.hits} 
            prefix={<Icon name="check_circle" className="mr-1 text-green-600" />} 
          />
        </Col>
        <Col span={6}>
          <Statistic 
            title="Cache Misses" 
            value={stats.misses} 
            prefix={<Icon name="cancel" className="mr-1 text-red-600" />} 
          />
        </Col>
        <Col span={6}>
          <Statistic 
            title="Memory Usage" 
            value={`${Math.round((stats.ksize + stats.vsize) / 1024)} KB`} 
            prefix={<Icon name="memory" className="mr-1 text-purple-600" />} 
          />
        </Col>
      </Row>

      <Divider />

      <div className="mb-4">
        <Text strong>Cache Hit Rate</Text>
        <Progress 
          percent={Math.round(hitRate)} 
          status={hitRate > 80 ? 'success' : hitRate > 50 ? 'normal' : 'exception'} 
          format={percent => `${percent}%`}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button onClick={handleClearMemoryCache}>
          <Icon name="delete" className="mr-1" />
          Clear Memory Cache
        </Button>
        <Button onClick={handleClearHttpCache}>
          <Icon name="cloud_off" className="mr-1" />
          Clear HTTP Cache
        </Button>
        <Button type="primary" danger onClick={handleClearAllCaches}>
          <Icon name="delete_forever" className="mr-1" />
          Clear All Caches
        </Button>
      </div>
    </Card>
  );
}