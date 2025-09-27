import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError, forgotPasswordStart, clearForgotPasswordState } from '../store/slices/authSlice';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { showToast } from '../components/Common/Toast';
import { Modal } from 'antd';
import { Mail } from 'lucide-react';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    loading,
    error,
    isAuthenticated,
    forgotPasswordLoading,
    forgotPasswordError,
    forgotPasswordSuccess
  } = useSelector(state => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');

  const from = location.state?.from?.pathname || '/';
  const state = location.state;

  // Handle success redirect + toast
  useEffect(() => {
    if (isAuthenticated) {
      if (state == null) {
        showToast({
          message: 'Login successful!',
          subMessage: 'Welcome back to VCare Furniture.',
          type: 'success',
          toastId: 'login-success',
        });
      }
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from, state]);

  // Handle login error toast + clear after
  useEffect(() => {
    if (error) {
      showToast({
        message: error || 'Login failed',
        type: 'error',
        toastId: 'login-error',
      });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Handle forgot password success/error toasts
  useEffect(() => {
    if (forgotPasswordSuccess) {
      showToast({
        message: 'Temporary password sent!',
        subMessage: 'Please check your email for a temporary password.',
        type: 'success',
        toastId: 'forgot-password-success',
      });
      setShowForgotPasswordModal(false);
      dispatch(clearForgotPasswordState());
    }
    if (forgotPasswordError) {
      showToast({
        message: forgotPasswordError || 'Failed to send temporary password',
        type: 'error',
        toastId: 'forgot-password-error',
      });
      dispatch(clearForgotPasswordState());
    }
  }, [forgotPasswordSuccess, forgotPasswordError, dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login(formData));
  };

  const handleForgotPasswordSubmit = () => {
    if (!forgotPasswordEmail.trim() || !/\S+@\S+\.\S+/.test(forgotPasswordEmail)) {
      showToast({
        message: 'Please enter a valid email address',
        type: 'error',
        toastId: 'forgot-password-validation-error',
      });
      return;
    }
    dispatch(forgotPasswordStart({ email: forgotPasswordEmail }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">VC</span>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/register"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              create a new account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="input-field mt-1"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="input-field mt-1"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <div className="text-sm">
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(true)}
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Forgot password?
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <LoadingSpinner size="small" />
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        title={
          <div className="flex items-center space-x-2">
            <Mail className="h-6 w-6 text-primary-600" />
            <h3 className="text-xl font-semibold">Forgot Password</h3>
          </div>
        }
        open={showForgotPasswordModal}
        onCancel={() => {
          setShowForgotPasswordModal(false);
          setForgotPasswordEmail('');
          dispatch(clearForgotPasswordState());
        }}
        footer={[
          <button
            key="back"
            onClick={() => {
              setShowForgotPasswordModal(false);
              setForgotPasswordEmail('');
              dispatch(clearForgotPasswordState());
            }}
            className="btn-secondary mr-2"
          >
            Cancel
          </button>,
          <button
            key="submit"
            onClick={handleForgotPasswordSubmit}
            disabled={forgotPasswordLoading}
            className="btn-primary"
          >
            {forgotPasswordLoading ? (
              <LoadingSpinner size="small" />
            ) : (
              'Send Temporary Password'
            )}
          </button>,
        ]}
      >
        <div className="py-4">
          <p className="text-gray-600 mb-4">
            Enter your email address and we'll send you a temporary password.
          </p>
          <label htmlFor="forgot-password-email" className="block text-sm font-medium text-gray-700 mb-2">
            Email address
          </label>
          <input
            id="forgot-password-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={forgotPasswordEmail}
            onChange={(e) => setForgotPasswordEmail(e.target.value)}
            className="input-field"
            placeholder="Enter your email"
          />
        </div>
      </Modal>
    </div>
  );
};

export default LoginPage;