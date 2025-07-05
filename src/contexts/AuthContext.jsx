import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { message } from 'antd';
import { getOrFetch, invalidateCache, invalidateCacheByPrefix } from '../utils/cache';

const initialState = {
  isAuthenticated: false,
  currentUser: null,
  users: [
    {
      id: 'USER-001',
      username: 'admin',
      password: 'admin123', // In production, this would be hashed
      email: 'admin@vcarefurniture.com',
      firstName: 'Sarah',
      lastName: 'Wilson',
      role: 'admin',
      isActive: true,
      permissions: {
        pos: { view: true, edit: true, delete: true },
        products: { view: true, edit: true, delete: true },
        'raw-materials': { view: true, edit: true, delete: true },
        transactions: { view: true, edit: true, delete: true },
        reports: { view: true, edit: true, delete: true },
        coupons: { view: true, edit: true, delete: true },
        tax: { view: true, edit: true, delete: true },
        'purchase-orders': { view: true, edit: true, delete: true },
        settings: { view: true, edit: true, delete: true },
        'user-management': { view: true, edit: true, delete: true },
        'audit-trail': { view: true, edit: true, delete: true }
      },
      createdAt: new Date('2024-01-01'),
      lastLogin: new Date()
    },
    {
      id: 'USER-002',
      username: 'cashier1',
      password: 'cashier123',
      email: 'john.doe@vcarefurniture.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'cashier',
      isActive: true,
      permissions: {
        pos: { view: true, edit: true, delete: false },
        products: { view: true, edit: false, delete: false },
        'raw-materials': { view: false, edit: false, delete: false },
        transactions: { view: true, edit: false, delete: false },
        reports: { view: false, edit: false, delete: false },
        coupons: { view: true, edit: false, delete: false },
        tax: { view: false, edit: false, delete: false },
        'purchase-orders': { view: false, edit: false, delete: false },
        settings: { view: false, edit: false, delete: false },
        'user-management': { view: false, edit: false, delete: false },
        'audit-trail': { view: false, edit: false, delete: false }
      },
      createdAt: new Date('2024-01-15'),
      lastLogin: new Date('2024-01-20')
    },
    {
      id: 'USER-003',
      username: 'manager1',
      password: 'manager123',
      email: 'jane.smith@vcarefurniture.com',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'manager',
      isActive: true,
      permissions: {
        pos: { view: true, edit: true, delete: true },
        products: { view: true, edit: true, delete: true },
        'raw-materials': { view: true, edit: true, delete: false },
        transactions: { view: true, edit: true, delete: false },
        reports: { view: true, edit: false, delete: false },
        coupons: { view: true, edit: true, delete: true },
        tax: { view: true, edit: true, delete: false },
        'purchase-orders': { view: true, edit: true, delete: false },
        settings: { view: true, edit: false, delete: false },
        'user-management': { view: true, edit: false, delete: false },
        'audit-trail': { view: true, edit: false, delete: false }
      },
      createdAt: new Date('2024-01-10'),
      lastLogin: new Date('2024-01-19')
    }
  ],
  auditTrail: [
    {
      id: 'AUDIT-001',
      userId: 'USER-001',
      userName: 'Sarah Wilson',
      action: 'CREATE',
      module: 'products',
      description: 'Created new product: Executive Dining Table',
      details: { productId: '1', productName: 'Executive Dining Table' },
      timestamp: new Date('2024-01-20T10:30:00'),
      ipAddress: '192.168.1.100'
    },
    {
      id: 'AUDIT-002',
      userId: 'USER-002',
      userName: 'John Doe',
      action: 'UPDATE',
      module: 'transactions',
      description: 'Completed transaction TXN-001',
      details: { transactionId: 'TXN-001', amount: 2915.95 },
      timestamp: new Date('2024-01-20T14:15:00'),
      ipAddress: '192.168.1.101'
    },
    {
      id: 'AUDIT-003',
      userId: 'USER-003',
      userName: 'Jane Smith',
      action: 'UPDATE',
      module: 'raw-materials',
      description: 'Updated stock for Oak Wood Planks',
      details: { materialId: '1', oldStock: 500, newStock: 475 },
      timestamp: new Date('2024-01-20T16:45:00'),
      ipAddress: '192.168.1.102'
    },
    {
      id: 'AUDIT-004',
      userId: 'USER-001',
      userName: 'Sarah Wilson',
      action: 'CREATE',
      module: 'user-management',
      description: 'Created new user account: John Doe',
      details: { userId: 'USER-002', role: 'cashier' },
      timestamp: new Date('2024-01-15T09:20:00'),
      ipAddress: '192.168.1.100'
    },
    {
      id: 'AUDIT-005',
      userId: 'USER-001',
      userName: 'Sarah Wilson',
      action: 'DELETE',
      module: 'products',
      description: 'Deleted product: Old Coffee Table',
      details: { productId: 'PROD-OLD-001', productName: 'Old Coffee Table' },
      timestamp: new Date('2024-01-19T11:30:00'),
      ipAddress: '192.168.1.100'
    }
  ]
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        currentUser: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        currentUser: null
      };
    case 'ADD_USER': {
      // Invalidate users cache
      invalidateCacheByPrefix('users');
      return {
        ...state,
        users: [...state.users, action.payload]
      };
    }
    case 'UPDATE_USER': {
      // Invalidate users cache
      invalidateCacheByPrefix('users');
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.id ? action.payload : user
        )
      };
    }
    case 'DELETE_USER': {
      // Invalidate users cache
      invalidateCacheByPrefix('users');
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload)
      };
    }
    case 'ADD_AUDIT_LOG': {
      // Invalidate audit trail cache
      invalidateCacheByPrefix('audit');
      return {
        ...state,
        auditTrail: [action.payload, ...state.auditTrail]
      };
    }
    case 'UPDATE_LAST_LOGIN': {
      // Invalidate users cache
      invalidateCacheByPrefix('users');
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.userId 
            ? { ...user, lastLogin: action.payload.timestamp }
            : user
        ),
        currentUser: state.currentUser?.id === action.payload.userId
          ? { ...state.currentUser, lastLogin: action.payload.timestamp }
          : state.currentUser
      };
    }
    default:
      return state;
  }
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Auto-login for development (remove in production)
  useEffect(() => {
    const savedUser = localStorage.getItem('vcare_current_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    }
  }, []);

  const login = async (username, password) => {
    const user = state.users.find(u => 
      u.username === username && 
      u.password === password && 
      u.isActive
    );

    if (user) {
      const loginTime = new Date();
      
      // Update last login
      dispatch({ 
        type: 'UPDATE_LAST_LOGIN', 
        payload: { userId: user.id, timestamp: loginTime }
      });

      // Log the login action
      logAction('LOGIN', 'authentication', `User logged in`, { userId: user.id });

      // Set current user
      const userWithLastLogin = { ...user, lastLogin: loginTime };
      dispatch({ type: 'LOGIN_SUCCESS', payload: userWithLastLogin });
      
      // Save to localStorage for persistence
      localStorage.setItem('vcare_current_user', JSON.stringify(userWithLastLogin));
      
      message.success(`Welcome back, ${user.firstName}!`);
      return { success: true, user: userWithLastLogin };
    } else {
      message.error('Invalid username or password');
      return { success: false, error: 'Invalid credentials' };
    }
  };

  const logout = () => {
    if (state.currentUser) {
      logAction('LOGOUT', 'authentication', `User logged out`, { userId: state.currentUser.id });
    }
    
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem('vcare_current_user');
    message.info('You have been logged out');
  };

  const logAction = (action, module, description, details = {}) => {
    if (state.currentUser) {
      const auditEntry = {
        id: `AUDIT-${Date.now()}`,
        userId: state.currentUser.id,
        userName: `${state.currentUser.firstName} ${state.currentUser.lastName}`,
        action,
        module,
        description,
        details,
        timestamp: new Date(),
        ipAddress: '192.168.1.100' // In production, get real IP
      };
      
      dispatch({ type: 'ADD_AUDIT_LOG', payload: auditEntry });
    }
  };

  const hasPermission = (module, action = 'view') => {
    if (!state.currentUser) return false;
    return state.currentUser.permissions[module]?.[action] || false;
  };

  const addUser = (userData) => {
    const newUser = {
      ...userData,
      id: `USER-${Date.now()}`,
      createdAt: new Date(),
      lastLogin: null
    };
    
    dispatch({ type: 'ADD_USER', payload: newUser });
    logAction('CREATE', 'user-management', `Created new user: ${userData.firstName} ${userData.lastName}`, { userId: newUser.id, role: userData.role });
    
    return newUser;
  };

  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
    logAction('UPDATE', 'user-management', `Updated user: ${userData.firstName} ${userData.lastName}`, { userId: userData.id });
  };

  const deleteUser = (userId) => {
    const user = state.users.find(u => u.id === userId);
    if (user) {
      dispatch({ type: 'DELETE_USER', payload: userId });
      logAction('DELETE', 'user-management', `Deleted user: ${user.firstName} ${user.lastName}`, { userId });
    }
  };

  // Cached data access methods
  const getUsers = async () => {
    return state.users;
  };

  const getAuditTrail = async () => {
    return state.auditTrail;
  };

  return (
    <AuthContext.Provider value={{
      ...state,
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