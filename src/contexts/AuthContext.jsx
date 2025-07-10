import React, { createContext, useContext, useState, useEffect } from 'react';
import { message } from 'antd';
import { authApi, auditApi } from '../api/apiClient';
import { supabase } from '../utils/supabaseClient';

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
  }, [isAuthenticated, currentUser]);

  // Fetch audit trail when authenticated
  useEffect(() => {
    if (hasPermission('audit-trail', 'view')) {
      fetchAuditTrail();
    }
  }, [isAuthenticated, currentUser]);

  const fetchUsers = async () => {
    try {
      // Try to fetch users from Supabase
      const { data, error } = await supabase.from('users').select('*');
      
      if (!error && data) {
        // Transform to match our expected format
        const formattedUsers = data.map(user => ({
          id: user.id,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          role: user.role,
          isActive: user.is_active,
          permissions: user.permissions || {},
          createdAt: user.created_at,
          lastLogin: user.last_login
        }));
        
        setUsers(formattedUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchAuditTrail = async () => {
    try {
      // Try to fetch audit trail from Supabase
      const { data, error } = await supabase.from('audit_trail').select('*');
      
      if (!error && data) {
        // Transform to match our expected format
        const formattedAudit = data.map(entry => ({
          id: entry.id,
          userId: entry.user_id,
          userName: entry.user_name,
          action: entry.action,
          module: entry.module,
          description: entry.description,
          details: entry.details,
          ipAddress: entry.ip_address,
          timestamp: entry.timestamp
        }));
        
        setAuditTrail(formattedAudit);
      }
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
    // Mock implementation
    return supabase.from('users').insert({
      id: userData.id || `USER-${Date.now()}`,
      username: userData.username,
      email: userData.email,
      first_name: userData.firstName,
      last_name: userData.lastName,
      role: userData.role,
      is_active: userData.isActive,
      permissions: userData.permissions
    }).select().then(({ data, error }) => {
      if (error) throw error;
      
      const newUser = {
        id: data[0].id,
        username: data[0].username,
        firstName: data[0].first_name,
        lastName: data[0].last_name,
        email: data[0].email,
        role: data[0].role,
        isActive: data[0].is_active,
        permissions: data[0].permissions
      };
      
      setUsers([...users, newUser]);
      return newUser;
    });
  };

  const updateUser = (userData) => {
    // Mock implementation
    return supabase.from('users').update({
      username: userData.username,
      email: userData.email,
      first_name: userData.firstName,
      last_name: userData.lastName,
      role: userData.role,
      is_active: userData.isActive,
      permissions: userData.permissions
    }).eq('id', userData.id).select().then(({ data, error }) => {
      if (error) throw error;
      
      const updatedUser = {
        id: data[0].id,
        username: data[0].username,
        firstName: data[0].first_name,
        lastName: data[0].last_name,
        email: data[0].email,
        role: data[0].role,
        isActive: data[0].is_active,
        permissions: data[0].permissions
      };
      
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
    // Mock implementation
    return supabase.from('users').delete().eq('id', userId).then(({ error }) => {
      if (error) throw error;
      
      setUsers(users.filter(user => user.id !== userId));
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