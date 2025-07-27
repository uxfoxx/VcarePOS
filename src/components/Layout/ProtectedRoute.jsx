import React from 'react';
import { useSelector } from 'react-redux';
import { useAuth } from '../../contexts/AuthContext';
import { Card, Typography } from 'antd';
import { Icon } from '../common/Icon';

const { Title, Text } = Typography;

export function ProtectedRoute({ children, module, action = 'view' }) {
  // Get authentication state from Redux
  const { isAuthenticated } = useSelector(state => state.auth);
  // Still use AuthContext for permission checking
  // This is because permissions are complex and may involve business logic
  const { hasPermission } = useAuth();

  // First check if user is authenticated
  if (!isAuthenticated) {
    return (
      <Card>
        <div className="text-center py-12">
          <Icon name="logout" className="text-6xl text-gray-300 mb-4" />
          <Title level={4} type="secondary">Authentication Required</Title>
          <Text type="secondary">
            Please log in to access this page.
          </Text>
        </div>
      </Card>
    );
  }

  // Then check specific permissions
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