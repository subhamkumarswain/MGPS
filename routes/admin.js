const express = require('express');
const router = express.Router();
const userService = require('../service/userService');

// Middleware to ensure user is authenticated
function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

// Middleware to check roles
function requireRole(roles) {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const userRoles = req.session.user.roles || [];
    const hasRole = userRoles.some(r => roles.includes(r));
    if (!hasRole) {
      return res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
    }
    next();
  };
}

/**
 * GET /api/admin/users
 * List all users and their roles
 */
router.get('/users', requireAuth, requireRole(['EL']), async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    // Strip sensitive fields (like passwordHash and salt) before sending
    const safeUsers = users.map(u => ({
      empId: u.empId,
      name: u.name,
      designation: u.designation,
      deptCode: u.deptCode,
      createdAt: u.createdAt,
      roles: u.roles
    }));
    res.json(safeUsers);
  } catch (err) {
    console.error('Error in admin GET users:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/admin/users/:empId
 * Update employee profile details and roles
 */
router.put('/users/:empId', requireAuth, requireRole(['EL']), async (req, res) => {
  try {
    const empId = req.params.empId;
    const { designation, deptCode, roles } = req.body;

    // Update profile
    await userService.updateUserProfile(empId, designation, deptCode);

    // Update roles
    if (roles && Array.isArray(roles)) {
      await userService.updateUserRoles(empId, roles);
    }

    res.json({ success: true, message: 'User updated successfully' });
  } catch (err) {
    console.error('Error in admin PUT user:', err);
    res.status(400).json({ error: err.message });
  }
});

/**
 * DELETE /api/admin/users/:empId
 * Delete user account
 */
router.delete('/users/:empId', requireAuth, requireRole(['EL']), async (req, res) => {
  try {
    const empId = req.params.empId;

    // Prevent deleting oneself
    if (empId === req.session.user.empId) {
      return res.status(400).json({ error: 'Cannot delete your own administrator account' });
    }

    const result = await userService.deleteUser(empId);
    res.json(result);
  } catch (err) {
    console.error('Error in admin DELETE user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
