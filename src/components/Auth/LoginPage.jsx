import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Typography, 
  Space, 
  Alert,
  Row,
  Col,
  Divider
} from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import { Icon } from '../common/Icon';

const { Title, Text } = Typography;

export function LoginPage() {
  const { login } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (values) => {
    setLoading(true);
    setError('');
    
    try {
      const result = await login(values.username, values.password);
      if (!result.success) {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { username: 'admin', password: 'admin123', role: 'Administrator', description: 'Full system access' },
    { username: 'manager1', password: 'manager123', role: 'Manager', description: 'Management access' },
    { username: 'cashier1', password: 'cashier123', role: 'Cashier', description: 'POS access only' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <Row gutter={32} align="middle">
          {/* Left Side - Branding */}
          <Col xs={24} lg={12} className="text-center lg:text-left mb-8 lg:mb-0">
            <div className="space-y-6">
              <div className="flex items-center justify-center lg:justify-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <img 
                    src="/VCARELogo 1.png" 
                    alt="VCare Logo" 
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <div>
                  <Title level={1} className="m-0 text-gray-900">
                    VCare POS
                  </Title>
                  <Text type="secondary" className="text-lg">
                    Furniture Store Management System
                  </Text>
                </div>
              </div>
              
              <div className="space-y-4">
                <Title level={3} className="text-gray-700">
                  Welcome Back
                </Title>
                <Text type="secondary" className="text-base block">
                  Sign in to access your furniture store management dashboard. 
                  Manage inventory, process sales, and track your business performance.
                </Text>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="text-center p-4 bg-white rounded-lg shadow-sm border">
                  <Icon name="inventory_2" className="text-blue-500 text-2xl mb-2" />
                  <Text strong className="block">Inventory</Text>
                  <Text type="secondary" className="text-sm">Manage Products</Text>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm border">
                  <Icon name="point_of_sale" className="text-green-500 text-2xl mb-2" />
                  <Text strong className="block">Sales</Text>
                  <Text type="secondary" className="text-sm">Process Orders</Text>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm border">
                  <Icon name="analytics" className="text-purple-500 text-2xl mb-2" />
                  <Text strong className="block">Reports</Text>
                  <Text type="secondary" className="text-sm">Track Performance</Text>
                </div>
              </div>
            </div>
          </Col>

          {/* Right Side - Login Form */}
          <Col xs={24} lg={12}>
            <Card className="shadow-xl border-0 bg-white/95 backdrop-blur">
              <div className="text-center mb-6">
                <Title level={3} className="text-gray-900 mb-2">
                  Sign In
                </Title>
                <Text type="secondary">
                  Enter your credentials to access the system
                </Text>
              </div>

              {error && (
                <Alert
                  message="Login Failed"
                  description={error}
                  type="error"
                  showIcon
                  className="mb-4"
                />
              )}

              <Form
                form={form}
                layout="vertical"
                onFinish={handleLogin}
                size="large"
              >
                <Form.Item
                  name="username"
                  label="Username"
                  rules={[{ required: true, message: 'Please enter your username' }]}
                >
                  <Input
                    prefix={<Icon name="person" className="text-gray-400" />}
                    placeholder="Enter username"
                    autoComplete="username"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label="Password"
                  rules={[{ required: true, message: 'Please enter your password' }]}
                >
                  <Input.Password
                    prefix={<Icon name="lock" className="text-gray-400" />}
                    placeholder="Enter password"
                    autoComplete="current-password"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    size="large"
                    className="bg-[#0E72BD] hover:bg-blue-700 h-12 text-lg font-semibold"
                  >
                    Sign In
                  </Button>
                </Form.Item>
              </Form>

              <Divider>Demo Accounts</Divider>

              <div className="space-y-3">
                <Text type="secondary" className="text-sm block text-center mb-3">
                  Use these demo accounts to explore different access levels:
                </Text>
                
                {demoAccounts.map((account, index) => (
                  <Card 
                    key={index} 
                    size="small" 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => {
                      form.setFieldsValue({
                        username: account.username,
                        password: account.password
                      });
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <Text strong className="text-sm">{account.role}</Text>
                        <br />
                        <Text type="secondary" className="text-xs">
                          {account.description}
                        </Text>
                      </div>
                      <div className="text-right">
                        <Text code className="text-xs block">
                          {account.username}
                        </Text>
                        <Text code className="text-xs block">
                          {account.password}
                        </Text>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="mt-6 text-center">
                <Text type="secondary" className="text-xs">
                  © 2024 VCare Furniture Store. All rights reserved.
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}