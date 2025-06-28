import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, Typography } from 'antd';
import { Icon } from '../common/Icon';

const { Title, Text } = Typography;

export function ProtectedRoute({ children, module, action = 'view' }) {
  const { hasPermission } = useAuth();

  if (!hasPermission(module, action)) {
    return (
      <Card>
        <div className="text-center py-12">
          <Icon name="lock" className="text-6xl text-gray-300 mb-4" />
          <Title level={4} type="secondary">Access Denied</Title>
          <Text type="secondary">
            You do not have permission to {action} {module.replace('-', ' ')}.
          </Text>
        </div>
      </Card>
    );
  }

  return children;
}