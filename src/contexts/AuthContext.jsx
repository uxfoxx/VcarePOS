import React, { createContext, useContext, useState, useEffect } from 'react';
import { message } from 'antd';
import { authApi, auditApi } from '../api/apiClient';


const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [auditTrail, setAuditTrail] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('vcare_token');
    if (token) {
      // Verify token and get user data
      authApi.getCurrentUser()
        .then(user => {
          setCurrentUser(user);
          setIsAuthenticated(true);
        })
        .catch(() => {
          // Invalid token, remove it
          localStorage.removeItem('vcare_token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch users when authenticated
  useEffect(() => {
    if (isAuthenticated && currentUser?.role === 'admin') {
      fetchUsers();
    }
  }, [isAuthenticated, currentUser]);

  // Fetch audit trail when authenticated
  useEffect(() => {
    if (isAuthenticated && hasPermission('audit-trail', 'view')) {
      fetchAuditTrail();
    }
  }, [isAuthenticated, currentUser]);

  const fetchUsers = async () => {
    try {
      const data = await usersApi.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchAuditTrail = async () => {
    try {
      const data = await auditApi.getAll();
      setAuditTrail(data);
    } catch (error) {
      console.error('Error fetching audit trail:', error);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await authApi.login(username, password);
      
      // Save token to localStorage
      localStorage.setItem('vcare_token', response.token);
      
      // Set current user
      setCurrentUser(response.user);
      setIsAuthenticated(true);
      
      message.success(`Welcome back, ${response.user.firstName}!`);
      return { success: true, user: response.user };
    } catch (error) {
      message.error(error.message || 'Invalid username or password');
      return { success: false, error: error.message || 'Invalid credentials' };
    }
  };

  const logout = () => {
    try {
      // Call logout API
      if (isAuthenticated) {
        authApi.logout().catch(console.error);
      }
      
      // Clear token and user data
      localStorage.removeItem('vcare_token');
      setCurrentUser(null);
      setIsAuthenticated(false);
      
      message.info('You have been logged out');
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
    return usersApi.create(userData)
      .then(newUser => {
        setUsers([...users, newUser]);
        return newUser;
      });
  };

  const updateUser = (userData) => {
    return usersApi.update(userData.id, userData)
      .then(updatedUser => {
        setUsers(users.map(user => 
          user.id === updatedUser.id ? updatedUser : user
        ));
        
        // Update current user if it's the same user
        if (currentUser?.id === updatedUser.id) {
          setCurrentUser(updatedUser);
        }
        
        return updatedUser;
      });
  };

  const deleteUser = (userId) => {
    return usersApi.delete(userId)
      .then(() => {
        setUsers(users.filter(user => user.id !== userId));
      });
  };

  const getAuditTrail = async () => {
    try {
      const data = await auditApi.getAll();
      setAuditTrail(data);
      return data;
    } catch (error) {
      console.error('Error fetching audit trail:', error);
      return auditTrail;
    }
  };

  const getUsers = async () => {
    try {
      const data = await usersApi.getAll();
      setUsers(data);
      return data;
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