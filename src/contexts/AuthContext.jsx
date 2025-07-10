import React, { createContext, useContext, useState, useEffect } from 'react';
import { message } from 'antd';
import { authApi, auditApi } from '../api/apiClient';


const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Always authenticated
  const [currentUser, setCurrentUser] = useState({
    id: 'USER-001',
    username: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@vcarefurniture.com',
    role: 'admin',
    permissions: {
      'pos': { view: true, edit: true, delete: true },
      'products': { view: true, edit: true, delete: true },
      'raw-materials': { view: true, edit: true, delete: true },
      'transactions': { view: true, edit: true, delete: true },
      'reports': { view: true, edit: true, delete: true },
      'coupons': { view: true, edit: true, delete: true },
      'tax': { view: true, edit: true, delete: true },
      'purchase-orders': { view: true, edit: true, delete: true },
      'settings': { view: true, edit: true, delete: true },
      'user-management': { view: true, edit: true, delete: true },
      'audit-trail': { view: true, edit: true, delete: true }
    }
  });
  const [users, setUsers] = useState([]);
  const [auditTrail, setAuditTrail] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Skip authentication check, always set loading to false
    setLoading(false);
    
    // Initialize with some mock users
    setUsers([
      {
        id: 'USER-001',
        username: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@vcarefurniture.com',
        role: 'admin',
        isActive: true,
        permissions: {
          'pos': { view: true, edit: true, delete: true },
          'products': { view: true, edit: true, delete: true },
          'raw-materials': { view: true, edit: true, delete: true },
          'transactions': { view: true, edit: true, delete: true },
          'reports': { view: true, edit: true, delete: true },
          'coupons': { view: true, edit: true, delete: true },
          'tax': { view: true, edit: true, delete: true },
          'purchase-orders': { view: true, edit: true, delete: true },
          'settings': { view: true, edit: true, delete: true },
          'user-management': { view: true, edit: true, delete: true },
          'audit-trail': { view: true, edit: true, delete: true }
        }
      },
      {
        id: 'USER-002',
        username: 'cashier1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@vcarefurniture.com',
        role: 'cashier',
        isActive: true,
        permissions: {
          'pos': { view: true, edit: true, delete: false },
          'products': { view: true, edit: false, delete: false },
          'raw-materials': { view: false, edit: false, delete: false },
          'transactions': { view: true, edit: false, delete: false },
          'reports': { view: false, edit: false, delete: false },
          'coupons': { view: true, edit: false, delete: false },
          'tax': { view: false, edit: false, delete: false },
          'purchase-orders': { view: false, edit: false, delete: false },
          'settings': { view: false, edit: false, delete: false },
          'user-management': { view: false, edit: false, delete: false },
          'audit-trail': { view: false, edit: false, delete: false }
        }
      }
    ]);
  }, []);

  // Fetch users when authenticated
  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchUsers();
    }
  }, [isAuthenticated, currentUser]);

  // Fetch audit trail when authenticated
  useEffect(() => {
    if (hasPermission('audit-trail', 'view')) {
      fetchAuditTrail();
    }
  }, [isAuthenticated, currentUser]);

  const fetchUsers = async () => {
    try {
      // Skip API call, we're using mock data
      // const data = await usersApi.getAll();
      // setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchAuditTrail = async () => {
    try {
      // Skip API call, we're using mock data
      // const data = await auditApi.getAll();
      // setAuditTrail([]);
    } catch (error) {
      console.error('Error fetching audit trail:', error);
    }
  };

  const login = async (username, password) => {
    try {
      // Skip actual login, always return success
      message.success(`Welcome back, Admin!`);
      return { success: true, user: currentUser };
    } catch (error) {
      message.error(error.message || 'Invalid username or password');
      return { success: false, error: error.message || 'Invalid credentials' };
    }
  };

  const logout = () => {
    try {
      // Skip actual logout
      message.info('Logout is disabled in this demo mode');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // This function is kept for backward compatibility
  // The actual logging is now handled by the backend middleware
  const logAction = () => {};

  const hasPermission = (module, action = 'view') => {
    if (!currentUser) return false;
    return currentUser.permissions[module]?.[action] || false;
  };

  const addUser = (userData) => {
    // Mock implementation
    const newUser = { ...userData, id: `USER-${Date.now()}` };
    setUsers([...users, newUser]);
    return Promise.resolve(newUser);
  };

  const updateUser = (userData) => {
    // Mock implementation
    const updatedUser = { ...userData };
    setUsers(users.map(user => 
      user.id === updatedUser.id ? updatedUser : user
    ));
    
    // Update current user if it's the same user
    if (currentUser?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
    
    return Promise.resolve(updatedUser);
  };

  const deleteUser = (userId) => {
    // Mock implementation
    setUsers(users.filter(user => user.id !== userId));
    return Promise.resolve();
  };

  const getAuditTrail = async () => {
    try {
      // Mock implementation
      return auditTrail;
    } catch (error) {
      console.error('Error fetching audit trail:', error);
      return auditTrail;
    }
  };

  const getUsers = async () => {
    try {
      // Mock implementation
      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      return users;
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
      logAction,
      hasPermission,
      addUser,
      updateUser,
      deleteUser,
      getUsers,
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