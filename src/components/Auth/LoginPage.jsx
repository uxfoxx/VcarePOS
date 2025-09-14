import React, { useState, useEffect } from 'react';
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
  Divider,
  Progress,
  Tooltip
} from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '../../contexts/AuthContext';
import { Icon } from '../common/Icon';
import { clearAuthError } from '../../features/auth/authSlice';

const { Title, Text } = Typography; 

// Secure obfuscated demo accounts (access info only revealed on demand)
const DEMO_ACCOUNTS = [
  {
    role: 'Administrator',
    description: 'Full system access',
    // Credentials are obfuscated and only decoded when needed
    credentials: btoa(JSON.stringify({ username: 'admin', password: 'admin123' }))
  },
  {
    role: 'Manager',
    description: 'Management access',
    credentials: btoa(JSON.stringify({ username: 'manager1', password: 'manager123' }))
  },
  {
    role: 'Cashier',
    description: 'POS access only',
    credentials: btoa(JSON.stringify({ username: 'cashier1', password: 'cashier123' }))
  }
];

export function LoginPage() {
  const { login } = useAuth();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [showCredentials, setShowCredentials] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  // Get auth state directly from Redux
  const { loading, error, sessionExpiredMessage } = useSelector(state => state.auth);

  // Clear any errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  // Calculate password strength for visual feedback
  const calculatePasswordStrength = (password) => {
    if (!password) return 0;
    
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 25;
    
    // Character variety checks
    if (/[A-Z]/.test(password)) strength += 25; // uppercase
    if (/[a-z]/.test(password)) strength += 25; // lowercase
    if (/[0-9]/.test(password)) strength += 12.5; // numbers
    if (/[^A-Za-z0-9]/.test(password)) strength += 12.5; // special chars
    
    return Math.min(strength, 100);
  };

  const handlePasswordChange = (e) => {
    setPasswordStrength(calculatePasswordStrength(e.target.value));
  };

  const handleLogin = async (values) => {
    await login(values.username, values.password);
  };
  
  const toggleCredentials = (index) => {
    setShowCredentials(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const fillDemoCredentials = (encodedCredentials) => {
    try {
      const credentials = JSON.parse(atob(encodedCredentials));
      form.setFieldsValue(credentials);
      setPasswordStrength(calculatePasswordStrength(credentials.password));
    } catch (err) {
      console.error('Error decoding credentials', err);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 30) return 'red';
    if (passwordStrength < 70) return 'orange';
    return 'green';
  };

  const getErrorMessage = () => {
    // Show session expired message with priority
    if (sessionExpiredMessage) return sessionExpiredMessage;
    if (!error) return null;
    
    // Check for specific error patterns
    if (error.includes('network') || error.includes('connect')) {
      return 'Network error. Please check your internet connection.';
    }
    if (error.includes('401') || error.includes('credentials') || error.includes('Invalid')) {
      return 'Invalid username or password. Please try again.';
    }
    
    // Default error message
    return error;
  };

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
                    src={localStorage.getItem('vcare_branding') && JSON.parse(localStorage.getItem('vcare_branding')).logoPreview 
                      ? JSON.parse(localStorage.getItem('vcare_branding')).logoPreview 
                      : "/VCARELogo 1.png"} 
                    alt="VCare Logo" 
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <div>
                  <Title level={1} className="m-0 text-gray-900">
                    {localStorage.getItem('vcare_branding') && JSON.parse(localStorage.getItem('vcare_branding')).businessName 
                      ? JSON.parse(localStorage.getItem('vcare_branding')).businessName.split(' ')[0] 
                      : "VCare"} POS System
                  </Title>
                  <Text type="secondary" className="text-lg">
                    {localStorage.getItem('vcare_branding') && JSON.parse(localStorage.getItem('vcare_branding')).tagline 
                      ? JSON.parse(localStorage.getItem('vcare_branding')).tagline 
                      : "Furniture Store Management System"}
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

              {getErrorMessage() && (
                <Alert
                  message={sessionExpiredMessage ? "Session Expired" : "Login Failed"}
                  description={getErrorMessage()}
                  type={sessionExpiredMessage ? "warning" : "error"}
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
                    onChange={handlePasswordChange}
                  />
                </Form.Item>
                
                {passwordStrength > 0 && (
                  <div className="mb-4">
                    <Tooltip title={
                      passwordStrength < 30 ? "Weak password" :
                      passwordStrength < 70 ? "Medium strength password" :
                      "Strong password"
                    }>
                      <Progress 
                        percent={passwordStrength} 
                        showInfo={false}
                        strokeColor={getPasswordStrengthColor()}
                        size="small"
                      />
                    </Tooltip>
                  </div>
                )}

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
                
                {DEMO_ACCOUNTS.map((account, index) => (
                  <Card 
                    key={index} 
                    size="small" 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => fillDemoCredentials(account.credentials)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <Text strong className="text-sm">{account.role}</Text>
                        <br />
                        <Text type="secondary" className="text-xs">
                          {account.description}
                        </Text>
                      </div>
                      <div className="flex items-center">
                        <Button 
                          type="text" 
                          size="small" 
                          icon={showCredentials[index] ? <Icon name="visibility_off" /> : <Icon name="visibility" />}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCredentials(index);
                          }} 
                        />
                        {showCredentials[index] && (
                          <div className="text-right">
                            {(() => {
                              try {
                                const { username, password } = JSON.parse(atob(account.credentials));
                                return (
                                  <>
                                    <Text code className="text-xs block">
                                      {username}
                                    </Text>
                                    <Text code className="text-xs block">
                                      {password}
                                    </Text>
                                  </>
                                );
                              } catch (err) {
                                return <Text type="danger">Error loading credentials</Text>;
                              }
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="mt-6 text-center">
                <Text type="secondary" className="text-xs">
                  © {new Date().getFullYear()} {localStorage.getItem('vcare_branding') && JSON.parse(localStorage.getItem('vcare_branding')).businessName 
                    ? JSON.parse(localStorage.getItem('vcare_branding')).businessName 
                    : "VCare Furniture Store"}. All rights reserved.
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}