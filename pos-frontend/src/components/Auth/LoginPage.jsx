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
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8" style={{
      backgroundImage: `radial-gradient(circle at 0% 0%, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)`
    }}>
      <div className="w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[600px] border border-white/50 relative">

        {/* Left Side - Branding Hero (Hidden on mobile) */}
        <div className="hidden md:flex md:w-5/12 bg-gradient-to-br from-[#0E72BD] to-[#084270] p-12 text-white flex-col justify-between relative overflow-hidden overflow-y-auto">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#042440] to-transparent opacity-50"></div>
          <div className="absolute bottom-10 left-10 w-32 h-32 rounded-full border-4 border-white/10 opacity-50 mix-blend-overlay"></div>

          <div className="relative z-10">
            <div className="bg-white/20 p-3 rounded-2xl inline-block mb-8 backdrop-blur-md border border-white/30 shadow-lg">
              <Icon name="point_of_sale" className="text-4xl text-white" />
            </div>
            <h1 className="text-4xl font-extrabold mb-4 leading-tight tracking-tight">
              Advanced Retail <br />
              <span className="text-blue-200">Management</span>
            </h1>
            <p className="text-blue-100 text-lg leading-relaxed max-w-sm">
              Streamline your point of sale, track inventory in real-time, and manage your e-commerce from one unified platform.
            </p>
          </div>

          <div className="relative z-10 mt-12">
            <div className="bg-black/20 p-6 rounded-2xl backdrop-blur-sm border border-white/10 shadow-inner">
              <div className="flex items-center space-x-4 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center">
                  <Icon name="speed" className="text-white bg-transparent" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Lightning Fast</h4>
                  <p className="text-xs text-blue-200">Optimized for speed & efficiency</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-7/12 p-8 md:p-16 flex flex-col justify-center relative bg-white/90 backdrop-blur overflow-y-auto">
          <div className="w-full max-w-md mx-auto">
            <div className="text-center md:text-left mb-10">
              <img
                src={localStorage.getItem('vcare_branding') && JSON.parse(localStorage.getItem('vcare_branding')).logoPreview
                  ? JSON.parse(localStorage.getItem('vcare_branding')).logoPreview
                  : "/VCARELogo 1.png"}
                alt="VCare Logo"
                className="h-[50px] object-contain mb-8 mx-auto md:mx-0 drop-shadow-sm"
              />
              <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Welcome Back</h2>
              <p className="text-gray-500 mt-2 text-base">Sign in to your account to continue</p>
            </div>

            {getErrorMessage() && (
              <Alert
                message={sessionExpiredMessage ? "Session Expired" : "Login Failed"}
                description={getErrorMessage()}
                type={sessionExpiredMessage ? "warning" : "error"}
                showIcon
                className="mb-8 rounded-xl"
              />
            )}

            <Form
              form={form}
              layout="vertical"
              onFinish={handleLogin}
              size="large"
              className="mt-2"
            >
              <Form.Item
                name="username"
                label={<span className="font-medium text-gray-700">Username</span>}
                rules={[
                  { required: true, message: 'Please enter your username' },
                  { min: 3, message: 'Username must be at least 3 characters' },
                  { max: 50, message: 'Username must be less than 50 characters' },
                  {
                    pattern: /^[a-zA-Z0-9_]+$/,
                    message: 'Username can only contain letters, numbers, and underscores'
                  }
                ]}
                validateTrigger={['onChange', 'onBlur']}
                hasFeedback
              >
                <Input
                  prefix={<Icon name="person" className="text-gray-400 mr-2" />}
                  placeholder="Enter username"
                  autoComplete="username"
                  className="rounded-xl h-12"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label={<span className="font-medium text-gray-700">Password</span>}
                rules={[
                  { required: true, message: 'Please enter your password' },
                  { min: 6, message: 'Password must be at least 6 characters' }
                ]}
                validateTrigger={['onChange', 'onBlur']}
                hasFeedback
              >
                <Input.Password
                  prefix={<Icon name="lock" className="text-gray-400 mr-2" />}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  onChange={handlePasswordChange}
                  className="rounded-xl h-12"
                />
              </Form.Item>

              {passwordStrength > 0 && (
                <div className="mb-6 -mt-2">
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
                      className="m-0 p-0"
                    />
                  </Tooltip>
                </div>
              )}

              <Form.Item className="mt-8 mb-4">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  size="large"
                  className="bg-[#0E72BD] hover:bg-[#0A548E] h-12 rounded-xl text-lg font-semibold shadow-md hover:shadow-lg transition-all border-none"
                >
                  Sign In
                </Button>
              </Form.Item>
            </Form>

            <Divider className="my-8 text-gray-400 font-medium text-sm">Demo Accounts</Divider>

            <div className="space-y-4">
              <Text type="secondary" className="text-xs block text-center mb-4">
                Use these demo accounts to explore different access levels:
              </Text>

              {DEMO_ACCOUNTS.map((account, index) => (
                <Card
                  key={index}
                  size="small"
                  className="cursor-pointer hover:shadow-md transition-all hover:border-[#0E72BD] active:scale-[0.98] rounded-xl bg-gray-50/50 border-gray-200"
                  onClick={() => fillDemoCredentials(account.credentials)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <Text strong className="text-sm text-gray-700">{account.role}</Text>
                      <br />
                      <Text type="secondary" className="text-xs">
                        {account.description}
                      </Text>
                    </div>
                    <div className="flex items-center">
                      <Button
                        type="text"
                        size="small"
                        icon={showCredentials[index] ? <Icon name="visibility_off" className="text-gray-500" /> : <Icon name="visibility" className="text-gray-400" />}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCredentials(index);
                        }}
                        className="hover:bg-gray-200 mr-2"
                      />
                      {showCredentials[index] && (
                        <div className="text-right">
                          {(() => {
                            try {
                              const { username, password } = JSON.parse(atob(account.credentials));
                              return (
                                <>
                                  <Text code className="text-[10px] block leading-tight text-gray-600 bg-gray-100">
                                    {username}
                                  </Text>
                                  <Text code className="text-[10px] block leading-tight text-gray-600 bg-gray-100 mt-1">
                                    {password}
                                  </Text>
                                </>
                              );
                            } catch (err) {
                              return <Text type="danger">Error</Text>;
                            }
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Text type="secondary" className="text-xs">
                © {new Date().getFullYear()} {localStorage.getItem('vcare_branding') && JSON.parse(localStorage.getItem('vcare_branding')).businessName
                  ? JSON.parse(localStorage.getItem('vcare_branding')).businessName
                  : "VCare Furniture Store"}. All rights reserved.
              </Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}