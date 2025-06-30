import React from 'react';
import { Layout, Typography, Space, Divider } from 'antd';

const { Footer: AntFooter } = Layout;
const { Text } = Typography;

export function Footer({ style }) {
  return (
    <AntFooter style={style}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Text type="secondary" className="text-xs">
            © 2024 VCare POS System. All rights reserved.
          </Text>
          <Divider type="vertical" />
          <Text type="secondary" className="text-xs">
            Version 1.0.0
          </Text>
        </div>
        
        <div className="flex items-center space-x-4">
          <Space size="small">
            <span className="material-icons text-green-500 text-sm">circle</span>
            <Text type="secondary" className="text-xs">System Online</Text>
          </Space>
          <Divider type="vertical" />
          <Text type="secondary" className="text-xs">
            Last sync: {new Date().toLocaleTimeString()}
          </Text>
        </div>
      </div>
    </AntFooter>
  );
}