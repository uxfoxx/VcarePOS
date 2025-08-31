import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Typography, 
  Space, 
  Alert,
  Divider
} from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearAuthError } from '../../features/auth/authSlice';
import { Icon } from '../common/Icon';

const { Title, Text } = Typography;

export function LoginPage() {
  const dispatch = useDispatch();
  const { loading, error, sessionExpiredMessage } = useSelector(state => state.auth);
  const [form] = Form.useForm();

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const handleSubmit = (values) => {
    dispatch(login(values));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <img 
                src={localStorage.getItem('vcare_branding') && JSON.parse(localStorage.getItem('vcare_branding')).logoPreview 
                  ? JSON.parse(localStorage.getItem('vcare_branding')).logoPreview 
                  : "/VCARELogo 1.png"} 
                alt="VCare Logo" 
                className="w-12 h-12 object-contain"
              />
            </div>
            <Title level={2} className="mb-2 text-gray-800">
              Welcome Back
            </Title>
            <Text type="secondary" className="text-base">
              Sign in to your VCare POS account
            </Text>
          </div>

          {/* Session Expired Alert */}
          {sessionExpiredMessage && (
            <Alert
              message="Session Expired"
              description={sessionExpiredMessage}
              type="warning"
              showIcon
              className="mb-6"
              closable
              onClose={() => dispatch(clearAuthError())}
            />
          )}

          {/* Error Alert */}
          {error && (
            <Alert
              message="Login Failed"
              description={error}
              type="error"
              showIcon
              className="mb-6"
              closable
              onClose={() => dispatch(clearAuthError())}
            />
          )}

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            size="large"
            autoComplete="off"
          >
            <Form.Item
              name="username"
              label="Username"
              rules={[
                { required: true, message: 'Please enter your username' },
                { min: 3, message: 'Username must be at least 3 characters' }
              ]}
            >
              <Input
                prefix={<Icon name="person" className="text-gray-400" />}
                placeholder="Enter your username"
                autoComplete="username"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: 'Please enter your password' },
                { min: 6, message: 'Password must be at least 6 characters' }
              ]}
            >
              <Input.Password
                prefix={<Icon name="lock" className="text-gray-400" />}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item className="mb-6">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                className="h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-blue-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </Form.Item>
          </Form>

          <Divider className="my-6">
            <Text type="secondary" className="text-sm">Default Accounts</Text>
          </Divider>

          {/* Default Account Info */}
          <div className="space-y-3">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <Text strong className="text-blue-800">Administrator</Text>
                  <br />
                  <Text className="text-xs text-blue-600">Full system access</Text>
                </div>
                <div className="text-right">
                  <Text code className="text-xs">admin / admin123</Text>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <Text strong className="text-green-800">Manager</Text>
                  <br />
                  <Text className="text-xs text-green-600">Business operations</Text>
                </div>
                <div className="text-right">
                  <Text code className="text-xs">manager1 / manager123</Text>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <Text strong className="text-orange-800">Cashier</Text>
                  <br />
                  <Text className="text-xs text-orange-600">POS operations only</Text>
                </div>
                <div className="text-right">
                  <Text code className="text-xs">cashier1 / cashier123</Text>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Text type="secondary" className="text-xs">
              VCare POS System v1.0.0
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
}