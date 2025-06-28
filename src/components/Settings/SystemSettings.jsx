import React from 'react';
import { 
  Typography, 
  Row,
  Col,
  Descriptions,
  Progress,
  Tag,
  Alert
} from 'antd';
import { EnhancedCard } from '../common/EnhancedCard';
import { AnimatedCounter } from '../common/AnimatedCounter';
import { Icon } from '../common/Icon';

const { Title, Text } = Typography;

export function SystemSettings() {
  const systemInfo = {
    version: '1.0.0',
    buildDate: '2024-01-20',
    environment: 'Production',
    uptime: '15 days, 4 hours',
    lastBackup: '2024-01-20 02:00:00',
    databaseSize: '2.4 GB',
    storageUsed: 65,
    memoryUsage: 42,
    cpuUsage: 28
  };

  return (
    <div className="space-y-6">
      <Alert
        message="System Information"
        description="Monitor system health, performance metrics, and configuration details."
        type="info"
        showIcon
        icon={<Icon name="info" />}
      />

      <Row gutter={16}>
        <Col span={8}>
          <EnhancedCard
            title="Storage Usage"
            icon="storage"
            className="text-center"
          >
            <Progress
              type="circle"
              percent={systemInfo.storageUsed}
              format={(percent) => (
                <div>
                  <AnimatedCounter value={percent} suffix="%" className="text-2xl font-bold" />
                  <div className="text-sm text-gray-500">Used</div>
                </div>
              )}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
              size={120}
            />
            <Text type="secondary" className="block mt-2">
              {systemInfo.databaseSize} total
            </Text>
          </EnhancedCard>
        </Col>
        <Col span={8}>
          <EnhancedCard
            title="Memory Usage"
            icon="memory"
            className="text-center"
          >
            <Progress
              type="circle"
              percent={systemInfo.memoryUsage}
              format={(percent) => (
                <div>
                  <AnimatedCounter value={percent} suffix="%" className="text-2xl font-bold" />
                  <div className="text-sm text-gray-500">Used</div>
                </div>
              )}
              strokeColor={{
                '0%': '#52c41a',
                '100%': '#faad14',
              }}
              size={120}
            />
            <Text type="secondary" className="block mt-2">
              8 GB total
            </Text>
          </EnhancedCard>
        </Col>
        <Col span={8}>
          <EnhancedCard
            title="CPU Usage"
            icon="speed"
            className="text-center"
          >
            <Progress
              type="circle"
              percent={systemInfo.cpuUsage}
              format={(percent) => (
                <div>
                  <AnimatedCounter value={percent} suffix="%" className="text-2xl font-bold" />
                  <div className="text-sm text-gray-500">Used</div>
                </div>
              )}
              strokeColor={{
                '0%': '#1890ff',
                '100%': '#722ed1',
              }}
              size={120}
            />
            <Text type="secondary" className="block mt-2">
              4 cores
            </Text>
          </EnhancedCard>
        </Col>
      </Row>

      <EnhancedCard
        title="System Information"
        icon="computer"
        subtitle="Detailed system configuration and status"
      >
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Version">
            <Tag color="blue">{systemInfo.version}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Environment">
            <Tag color="green">{systemInfo.environment}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Build Date">
            {systemInfo.buildDate}
          </Descriptions.Item>
          <Descriptions.Item label="System Uptime">
            {systemInfo.uptime}
          </Descriptions.Item>
          <Descriptions.Item label="Last Backup">
            {systemInfo.lastBackup}
          </Descriptions.Item>
          <Descriptions.Item label="Database Size">
            {systemInfo.databaseSize}
          </Descriptions.Item>
          <Descriptions.Item label="Node.js Version">
            v18.17.0
          </Descriptions.Item>
          <Descriptions.Item label="React Version">
            v18.3.1
          </Descriptions.Item>
        </Descriptions>
      </EnhancedCard>

      <EnhancedCard
        title="Health Status"
        icon="health_and_safety"
        subtitle="System health monitoring and alerts"
      >
        <Row gutter={16}>
          <Col span={6}>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Icon name="check_circle" className="text-3xl text-green-500 mb-2" />
              <Text strong className="block">Database</Text>
              <Text type="secondary" className="text-sm">Healthy</Text>
            </div>
          </Col>
          <Col span={6}>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Icon name="wifi" className="text-3xl text-green-500 mb-2" />
              <Text strong className="block">Network</Text>
              <Text type="secondary" className="text-sm">Connected</Text>
            </div>
          </Col>
          <Col span={6}>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Icon name="backup" className="text-3xl text-green-500 mb-2" />
              <Text strong className="block">Backup</Text>
              <Text type="secondary" className="text-sm">Up to date</Text>
            </div>
          </Col>
          <Col span={6}>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Icon name="security" className="text-3xl text-green-500 mb-2" />
              <Text strong className="block">Security</Text>
              <Text type="secondary" className="text-sm">Secure</Text>
            </div>
          </Col>
        </Row>
      </EnhancedCard>
    </div>
  );
}