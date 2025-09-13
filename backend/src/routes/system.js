/**
 * System monitoring routes
 */
const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const { logSystemMetrics, handleRouteError } = require('../utils/loggerUtils');
const { logger } = require('../utils/logger');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: System
 *   description: System monitoring and diagnostics
 */

/**
 * @swagger
 * /system/health:
 *   get:
 *     summary: Get system health status
 *     tags: [System]
 *     responses:
 *       200:
 *         description: System is healthy
 *       500:
 *         description: System is not healthy
 */
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'System is healthy' });
});

/**
 * @swagger
 * /system/metrics:
 *   get:
 *     summary: Get system metrics
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System metrics
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin user
 */
router.get('/metrics', authenticate, (req, res) => {
  // Only allow admins to access metrics
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  // Get detailed metrics
  const metrics = logSystemMetrics(true);
  res.status(200).json(metrics);
});

/**
 * @swagger
 * /system/logs:
 *   get:
 *     summary: Get log files list
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of log files
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin user
 */
router.get('/logs', authenticate, async (req, res) => {
  // Only allow admins to access logs
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  try {
    const logDir = path.join(__dirname, '../../logs');
    const files = await fs.readdir(logDir);
    
    // Get file stats
    const logFiles = await Promise.all(files.map(async (file) => {
      const filePath = path.join(logDir, file);
      const stats = await fs.stat(filePath);
      return {
        name: file,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
      };
    }));
    
    res.status(200).json(logFiles);
  } catch (error) {
    logger.error('Error retrieving log files', { error });
    res.status(500).json({ message: 'Error retrieving log files' });
  }
});

/**
 * @swagger
 * /system/logs/{filename}:
 *   get:
 *     summary: Get log file content
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Log file content
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin user
 *       404:
 *         description: Log file not found
 */
router.get('/logs/:filename', authenticate, async (req, res) => {
  // Only allow admins to access logs
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  // Sanitize filename to prevent directory traversal
  const filename = path.basename(req.params.filename);
  const logDir = path.join(__dirname, '../../logs');
  const filePath = path.join(logDir, filename);
  
  try {
    // Check if file exists
    await fs.access(filePath);
    
    // Get query parameters for pagination
    const limit = parseInt(req.query.limit) || 1000;
    const page = parseInt(req.query.page) || 1;
    const tailLines = parseInt(req.query.tail) || 0;
    
    // Read file
    let fileContent = await fs.readFile(filePath, 'utf8');
    
    // Process the content based on the file type
    if (filePath.endsWith('.log') || filePath.endsWith('.json')) {
      // Split by lines
      let lines = fileContent.split('\n').filter(line => line.trim());
      
      // Apply tail if requested
      if (tailLines > 0) {
        lines = lines.slice(-tailLines);
      } 
      // Otherwise apply pagination
      else {
        const startIndex = (page - 1) * limit;
        lines = lines.slice(startIndex, startIndex + limit);
      }
      
      // Parse each line as JSON if it's a JSON log file
      try {
        const parsed = lines.map(line => JSON.parse(line));
        res.status(200).json({
          filename,
          totalLines: lines.length,
          page,
          limit,
          logs: parsed
        });
      } catch (e) {
        // If parsing fails, return raw lines
        res.status(200).json({
          filename,
          totalLines: lines.length,
          page,
          limit,
          logs: lines
        });
      }
    } else {
      // For non-JSON logs, just return the raw content
      res.status(200).json({
        filename,
        content: fileContent
      });
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404).json({ message: 'Log file not found' });
    } else {
      logger.error('Error reading log file', { error, filename });
      res.status(500).json({ message: 'Error reading log file' });
    }
  }
});

module.exports = router;
