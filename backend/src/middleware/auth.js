const jwt = require('jsonwebtoken');
const { pool } = require('../utils/db');

/**
 * Middleware to authenticate JWT token
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user to request
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};

/**
 * Middleware to check if user has required role
 * @param {string[]} roles - Array of allowed roles
 */
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to access this resource' });
    }
    
    next();
  };
};

/**
 * Middleware to check if user has permission for a specific module and action
 * @param {string} module - Module name
 * @param {string} action - Action name (view, edit, delete)
 */
const hasPermission = (module, action) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      // Admin role has all permissions
      if (req.user.role === 'admin') {
        return next();
      }
      
      // Check user permissions in database
      const client = await pool.connect();
      const result = await client.query(
        'SELECT permissions FROM users WHERE id = $1',
        [req.user.id]
      );
      client.release();
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const permissions = result.rows[0].permissions;
      
      if (!permissions || !permissions[module] || !permissions[module][action]) {
        return res.status(403).json({ 
          message: `You don't have permission to ${action} ${module}` 
        });
      }
      
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ message: 'Server error during permission check' });
    }
  };
};

/**
 * Log user action to audit trail
 */
const logAction = async (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    res.send = originalSend;
    
    // Only log successful actions
    if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
      const action = getActionType(req.method);
      const module = getModuleFromPath(req.path);
      
      if (action && module) {
        const auditEntry = {
          user_id: req.user.id,
          user_name: `${req.user.firstName} ${req.user.lastName}`,
          action,
          module,
          description: getDescription(action, module, req),
          details: JSON.stringify({
            method: req.method,
            path: req.path,
            body: req.body
          }),
          ip_address: req.ip
        };
        
        try {
          const client = await pool.connect();
          await client.query(
            `INSERT INTO audit_trail 
            (user_id, user_name, action, module, description, details, ip_address) 
            VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              auditEntry.user_id,
              auditEntry.user_name,
              auditEntry.action,
              auditEntry.module,
              auditEntry.description,
              auditEntry.details,
              auditEntry.ip_address
            ]
          );
          client.release();
        } catch (error) {
          console.error('Error logging action:', error);
        }
      }
    }
    
    return res.send(data);
  };
  
  next();
};

// Helper functions for audit logging
function getActionType(method) {
  switch (method) {
    case 'POST': return 'CREATE';
    case 'PUT':
    case 'PATCH': return 'UPDATE';
    case 'DELETE': return 'DELETE';
    case 'GET': return null; // Don't log GET requests
    default: return null;
  }
}

function getModuleFromPath(path) {
  const parts = path.split('/').filter(Boolean);
  if (parts.length >= 2 && parts[0] === 'api') {
    return parts[1];
  }
  return null;
}

function getDescription(action, module, req) {
  const resourceId = req.params.id;
  const resourceName = req.body.name || req.body.code || resourceId;
  
  switch (action) {
    case 'CREATE':
      return `Created new ${module.slice(0, -1)}: ${resourceName}`;
    case 'UPDATE':
      return `Updated ${module.slice(0, -1)}: ${resourceName}`;
    case 'DELETE':
      return `Deleted ${module.slice(0, -1)} with ID: ${resourceId}`;
    default:
      return `${action} operation on ${module}`;
  }
}

module.exports = {
  authenticate,
  authorize,
  hasPermission,
  logAction
};