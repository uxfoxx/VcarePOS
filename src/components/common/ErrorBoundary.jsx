import React from 'react';
import { Button, Result, Typography } from 'antd';
import { useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { Icon } from './Icon';

const { Text, Paragraph } = Typography;

class ErrorBoundaryFallback extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // Log error to monitoring service if available
    if (window.errorReporting) {
      window.errorReporting.captureException(error, { extra: errorInfo });
    }
  }

  render() {
    if (this.state.hasError) {
      // Check if error is related to authentication
      const isAuthError = this.state.error?.message?.toLowerCase().includes('auth') || 
                         this.state.error?.message?.toLowerCase().includes('login') ||
                         this.state.error?.message?.toLowerCase().includes('permission') ||
                         this.state.error?.message?.toLowerCase().includes('unauthorized') ||
                         this.state.error?.message?.toLowerCase().includes('token');

      return (
        <Result
          status="error"
          title={isAuthError ? "Authentication Error" : "Something went wrong"}
          subTitle={
            <div>
              <Paragraph>
                {isAuthError 
                  ? "There was a problem with your authentication. This could be due to an expired session or insufficient permissions."
                  : "We encountered an unexpected error. The development team has been notified."}
              </Paragraph>
              {this.props.showErrorDetails && (
                <div className="mt-4 p-4 bg-gray-100 rounded text-left overflow-auto max-h-40">
                  <Text code>{this.state.error?.toString()}</Text>
                </div>
              )}
            </div>
          }
          extra={[
            <ErrorActions 
              key="actions"
              isAuthError={isAuthError}
              onReset={() => {
                this.setState({ hasError: false, error: null, errorInfo: null });
                this.props.onReset?.();
              }}
            />
          ]}
        />
      );
    }

    return this.props.children;
  }
}

// We use a functional component for actions to use hooks
function ErrorActions({ isAuthError, onReset }) {
  const dispatch = useDispatch();
  
  const handleLogout = () => {
    dispatch(logout());
  };
  
  return (
    <div className="space-x-4">
      {isAuthError ? (
        <Button 
          type="primary" 
          onClick={handleLogout}
          icon={<Icon name="logout" />}
        >
          Log Out and Try Again
        </Button>
      ) : (
        <Button 
          type="primary" 
          onClick={onReset}
          icon={<Icon name="refresh" />}
        >
          Try Again
        </Button>
      )}
      <Button 
        onClick={() => window.location.href = '/'}
        icon={<Icon name="home" />}
      >
        Go to Homepage
      </Button>
    </div>
  );
}

// Export a wrapped version that can use hooks
export function ErrorBoundary({ children, showErrorDetails = false }) {
  return (
    <ErrorBoundaryFallback showErrorDetails={showErrorDetails}>
      {children}
    </ErrorBoundaryFallback>
  );
}