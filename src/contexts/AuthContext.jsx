import { createContext, useContext, useEffect } from 'react';
import { message } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { 
  login as loginAction,
  logout as logoutAction,
  getCurrentUser as getCurrentUserAction,
  changePassword as changePasswordAction,
  clearAuthError
} from '../features/auth/authSlice';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  
  // Get auth state from Redux
  const { 
    user: currentUser, 
    isAuthenticated, 
    loading, 
    error 
  } = useSelector(state => state.auth);
  
  const { usersList: users } = useSelector(state => state.users);
  const { auditList: auditTrail } = useSelector(state => state.audit);

  // Check auth status when component mounts
  useEffect(() => {
    if (!isAuthenticated && localStorage.getItem('vcare_token')) {
      dispatch(getCurrentUserAction());
    }
  }, [dispatch, isAuthenticated]);

  // Show error messages
  useEffect(() => {
    if (error) {
      message.error(error);
      // Clear the error to prevent showing it multiple times
      dispatch(clearAuthError());
    }
  }, [error, dispatch]);

  const login = async (username, password) => {
    try {
      dispatch(loginAction({ username, password }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || 'Invalid credentials' };
    }
  };

  const logout = () => {
    try {
      dispatch(logoutAction());
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      dispatch(changePasswordAction({ currentPassword, newPassword }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const hasPermission = (module, action = 'view') => {
    if (!currentUser) return false;
    return currentUser.permissions && currentUser.permissions[module]?.[action] || false;
  };

  // This function is kept for backward compatibility
  const logAction = () => {};

  const getAuditTrail = async () => {
    try {
      // Use the audit trail from Redux state
      return auditTrail;
    } catch (error) {
      console.error('Error fetching audit trail:', error);
      return auditTrail;
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      currentUser,
      users,
      auditTrail,
      loading,
      login,
      logout,
      changePassword,
      logAction,
      hasPermission,
      getAuditTrail
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}