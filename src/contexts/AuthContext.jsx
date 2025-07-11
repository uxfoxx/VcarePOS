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
    const checkAuth = async () => {
      // For development, set a default user if no token exists
      if (import.meta.env.DEV) {
        // Set default admin user for development
        setCurrentUser({
          id: 'USER-001',
          username: 'admin',
          firstName: 'Sarah',
          lastName: 'Wilson',
          email: 'admin@vcarefurniture.com',
          role: 'admin',
          permissions: {
            "pos": {"view": true, "edit": true, "delete": true},
            "products": {"view": true, "edit": true, "delete": true},
            "raw-materials": {"view": true, "edit": true, "delete": true},
            "transactions": {"view": true, "edit": true, "delete": true},
            "reports": {"view": true, "edit": true, "delete": true},
            "coupons": {"view": true, "edit": true, "delete": true},
            "tax": {"view": true, "edit": true, "delete": true},
            "purchase-orders": {"view": true, "edit": true, "delete": true},
            "settings": {"view": true, "edit": true, "delete": true},
            "user-management": {"view": true, "edit": true, "delete": true},
            "audit-trail": {"view": true, "edit": true, "delete": true}
          }
        });
        setIsAuthenticated(true);
        setLoading(false);
        return;
      }
      
      try {
        // Check for token in localStorage
        const token = localStorage.getItem('vcare_token');
        
        if (token) {
          // Try to get current user from API
          try {
            const user = await authApi.getCurrentUser();
            setCurrentUser(user);
            setIsAuthenticated(true);
          } catch (apiError) {
            console.error('API auth check failed, trying Supabase:', apiError);
            
            // Try Supabase session
            const { data: { session } } = await supabase.auth.getSession();
            
            if (session) {
              // Get user data from users table
              const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('email', session.user.email)
                .single();
              
              if (!userError && userData) {
                setCurrentUser({
                  id: userData.id,
                  username: userData.username,
                  firstName: userData.first_name,
                  lastName: userData.last_name,
                  email: userData.email,
                  role: userData.role,
                  permissions: userData.permissions || {}
                });
                setIsAuthenticated(true);
              } else {
                // Invalid token, remove it
                localStorage.removeItem('vcare_token');
              }
            } else {
              // No valid session, remove token
              localStorage.removeItem('vcare_token');
            }
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('vcare_token');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Fetch users when authenticated
  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchUsers();
    }
  }, [isAuthenticated, currentUser, fetchUsers]);

  // Fetch audit trail when authenticated
  useEffect(() => {
    if (hasPermission('audit-trail', 'view')) {
      fetchAuditTrail();
    }
  }, [isAuthenticated, currentUser, hasPermission, fetchAuditTrail]);

  const fetchUsers = async () => {
    try {
      // Fetch users from API
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('vcare_token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch users');
      
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchAuditTrail = async () => {
    try {
      // Fetch audit trail from API
      const response = await fetch(`${import.meta.env.VITE_API_URL}/audit`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('vcare_token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch audit trail');
      
      const data = await response.json();
      setAuditTrail(data);
    } catch (error) {
      console.error('Error fetching audit trail:', error);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await authApi.login(username, password);
      
      // Save token to localStorage
      if (response.token) {
        localStorage.setItem('vcare_token', response.token);
      }
      
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
    return currentUser.permissions && currentUser.permissions[module]?.[action] || false;
  };

  const addUser = (userData) => {
    return fetch(`${import.meta.env.VITE_API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('vcare_token')}`
      },
      body: JSON.stringify({
        id: userData.id || `USER-${Date.now()}`,
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        isActive: userData.isActive,
        permissions: userData.permissions
      })
    })
    .then(response => {
      if (!response.ok) throw new Error('Failed to create user');
      return response.json();
    })
    .then(newUser => {
      setUsers(prevUsers => [...prevUsers, newUser]);
      return newUser;
    });
  };

  const updateUser = (userData) => {
    return fetch(`${import.meta.env.VITE_API_URL}/users/${userData.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('vcare_token')}`
      },
      body: JSON.stringify({
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        isActive: userData.isActive,
        permissions: userData.permissions
      })
    })
    .then(response => {
      if (!response.ok) throw new Error('Failed to update user');
      return response.json();
    })
    .then(updatedUser => {
      setUsers(prevUsers => 
        prevUsers.map(user => user.id === updatedUser.id ? updatedUser : user)
      );
      
      // Update current user if it's the same user
      if (currentUser?.id === updatedUser.id) {
        setCurrentUser(updatedUser);
      }
      
      return updatedUser;
    });
  };

  const deleteUser = (userId) => {
    return fetch(`${import.meta.env.VITE_API_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('vcare_token')}`
      }
    })
    .then(response => {
      if (!response.ok) throw new Error('Failed to delete user');
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      return true;
    });
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