import React from 'react';
import { Card, Typography, Button, Space } from 'antd';
import { Icon } from './Icon';

const { Title, Text } = Typography;

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });
    
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="max-w-md w-full text-center">
            <Space direction="vertical" size="large" className="w-full">
              <div className="text-red-500">
                <Icon name="error" className="text-6xl" />
              </div>
              
              <div>
                <Title level={3} className="text-red-600 mb-2">
                  Something went wrong
                </Title>
                <Text type="secondary">
                  An unexpected error occurred. Please try refreshing the page.
                </Text>
              </div>

              {import.meta.env.DEV && this.state.error && (
                <div className="text-left bg-gray-50 p-3 rounded border text-xs">
                  <Text strong>Error Details:</Text>
                  <pre className="mt-2 text-red-600 whitespace-pre-wrap">
                    {this.state.error.toString()}
                  </pre>
                  {this.state.errorInfo && (
                    <pre className="mt-2 text-gray-600 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}

              <Space>
                <Button onClick={this.handleReset}>
                  Try Again
                </Button>
                <Button type="primary" onClick={this.handleReload}>
                  Reload Page
                </Button>
              </Space>
            </Space>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}