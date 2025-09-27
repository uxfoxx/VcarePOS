import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout, changePasswordStart, clearChangePasswordState } from '../store/slices/authSlice';
import { Link } from 'react-router-dom';
import { fetchOrders } from '../store/slices/ordersSlice';
import { Modal } from 'antd';
import { Key, CheckCircle } from 'lucide-react';
import { showToast } from '../components/Common/Toast';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { customer, changePasswordLoading, changePasswordError, changePasswordSuccess } = useSelector(state => state.auth);
  const { orders } = useSelector(state => state.orders);
  const [activeTab, setActiveTab] = useState('profile');
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [passwordFormErrors, setPasswordFormErrors] = useState({});

  useEffect(() => {
    if (customer) {
      dispatch(fetchOrders({ customerId: customer.id }));
    }
  }, [dispatch, customer]);

  // Handle change password success/error toasts
  useEffect(() => {
    if (changePasswordSuccess) {
      showToast({
        message: 'Password changed successfully!',
        subMessage: 'Your password has been updated.',
        type: 'success',
        toastId: 'change-password-success',
      });
      setShowChangePasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      setPasswordFormErrors({});
      dispatch(clearChangePasswordState());
    }
    if (changePasswordError) {
      showToast({
        message: changePasswordError || 'Failed to change password',
        type: 'error',
        toastId: 'change-password-error',
      });
      dispatch(clearChangePasswordState());
    }
  }, [changePasswordSuccess, changePasswordError, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
  };

  const handlePasswordFormChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value,
    });
    if (passwordFormErrors[e.target.name]) {
      setPasswordFormErrors(prev => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const validatePasswordForm = () => {
    const errors = {};
    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = 'New password must be at least 6 characters';
    }
    if (!passwordForm.confirmNewPassword) {
      errors.confirmNewPassword = 'Confirm new password is required';
    } else if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      errors.confirmNewPassword = 'New passwords do not match';
    }
    setPasswordFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChangePasswordSubmit = () => {
    if (validatePasswordForm()) {
      dispatch(changePasswordStart({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }));
    }
  };

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">
                  {customer?.firstName?.[0]}{customer?.lastName?.[0]}
                </span>
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">
                  {customer?.firstName} {customer?.lastName}
                </h2>
                <p className="text-sm text-gray-600">{customer?.email}</p>
              </div>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${activeTab === 'profile'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${activeTab === 'orders'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                Order History
              </button>
              <button
                onClick={() => setShowChangePasswordModal(true)}
                className="w-full text-left px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Change Password
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                Logout
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6">Profile Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={customer?.firstName || ''}
                    readOnly
                    className="input-field bg-gray-50 focus:ring-0 focus:border-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={customer?.lastName || ''}
                    readOnly
                    className="input-field bg-gray-50 focus:ring-0 focus:border-gray-300"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={customer?.email || ''}
                    readOnly
                    className="input-field bg-gray-50 focus:ring-0 focus:border-gray-300"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Member Since
                  </label>
                  <input
                    type="text"
                    value={customer?.createdAt ? new Date(customer.createdAt).toLocaleDateString() : ''}
                    readOnly
                    className="input-field bg-gray-50 focus:ring-0 focus:border-gray-300"
                  />
                </div>
              </div>

              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> To update your profile information, please contact our customer service team.
                </p>
              </div>
            </div>
          )}

          {/* Recent Orders Preview */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Recent Orders</h2>
                <Link to="/orders" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  View All Orders
                </Link>
              </div>

              {recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">No orders yet</p>
                  <Link to="/products" className="btn-primary">
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map(order => (
                    <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Order #{order.id}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} items
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary-600">
                          LKR {order.totalAmount.toFixed(2)}
                        </p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${order.orderStatus === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : order.orderStatus === 'processing'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {order.orderStatus === 'pending_payment' ? 'Pending Payment' :
                            order.orderStatus === 'processing' ? 'Processing' :
                              order.orderStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal
        title={
          <div className="flex items-center space-x-2">
            <Key className="h-6 w-6 text-primary-600" />
            <h3 className="text-xl font-semibold">Change Password</h3>
          </div>
        }
        open={showChangePasswordModal}
        onCancel={() => {
          setShowChangePasswordModal(false);
          setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
          setPasswordFormErrors({});
          dispatch(clearChangePasswordState());
        }}
        footer={[
          <button
            key="back"
            onClick={() => {
              setShowChangePasswordModal(false);
              setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
              setPasswordFormErrors({});
              dispatch(clearChangePasswordState());
            }}
            className="btn-secondary mr-2"
          >
            Cancel
          </button>,
          <button
            key="submit"
            onClick={handleChangePasswordSubmit}
            disabled={changePasswordLoading}
            className="btn-primary"
          >
            {changePasswordLoading ? (
              <LoadingSpinner size="small" />
            ) : (
              'Change Password'
            )}
          </button>,
        ]}
      >
        <div className="py-4">
          <p className="text-gray-600 mb-4">
            Enter your current password and new password to update your account.
          </p>
          <div className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                required
                value={passwordForm.currentPassword}
                onChange={handlePasswordFormChange}
                className="input-field"
                placeholder="Enter current password"
              />
              {passwordFormErrors.currentPassword && (
                <p className="text-red-500 text-xs mt-1">{passwordFormErrors.currentPassword}</p>
              )}
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                value={passwordForm.newPassword}
                onChange={handlePasswordFormChange}
                className="input-field"
                placeholder="Enter new password"
              />
              {passwordFormErrors.newPassword && (
                <p className="text-red-500 text-xs mt-1">{passwordFormErrors.newPassword}</p>
              )}
            </div>
            <div>
              <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                id="confirmNewPassword"
                name="confirmNewPassword"
                type="password"
                required
                value={passwordForm.confirmNewPassword}
                onChange={handlePasswordFormChange}
                className="input-field"
                placeholder="Confirm new password"
              />
              {passwordFormErrors.confirmNewPassword && (
                <p className="text-red-500 text-xs mt-1">{passwordFormErrors.confirmNewPassword}</p>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProfilePage;
