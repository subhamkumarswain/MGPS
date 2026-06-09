const express = require('express');
const router = express.Router();
const gatepassService = require('../service/gatepassService');

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
 * POST /api/gatepass
 * Apply for a new gatepass
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { gatepassType, reason, outTime, inTime } = req.body;
    const empId = req.session.user.empId;

    const result = await gatepassService.applyGatepass(empId, gatepassType, reason, outTime, inTime);
    res.status(201).json(result);
  } catch (err) {
    console.error('Error applying for gatepass:', err);
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/gatepass/my
 * View logged-in employee's gatepasses
 */
router.get('/my', requireAuth, async (req, res) => {
  try {
    const empId = req.session.user.empId;
    const passes = await gatepassService.getMyGatepasses(empId);
    res.json(passes);
  } catch (err) {
    console.error('Error getting my gatepasses:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/gatepass/pending
 * View pending gatepasses (Supervisor only: E1 or EL)
 */
router.get('/pending', requireAuth, requireRole(['E1', 'EL']), async (req, res) => {
  try {
    const passes = await gatepassService.getPendingGatepasses();
    res.json(passes);
  } catch (err) {
    console.error('Error getting pending gatepasses:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/gatepass/approved
 * View approved gatepasses for security checks (CISF only)
 */
router.get('/approved', requireAuth, requireRole(['CISF']), async (req, res) => {
  try {
    const passes = await gatepassService.getApprovedGatepasses();
    res.json(passes);
  } catch (err) {
    console.error('Error getting approved gatepasses:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/gatepass/:id/approve
 * Approve or Reject a gatepass (Supervisor only: E1 or EL)
 */
router.post('/:id/approve', requireAuth, requireRole(['E1', 'EL']), async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body; // 'APPROVED' or 'REJECTED'
    const approvedBy = req.session.user.empId;

    const result = await gatepassService.approveGatepass(id, status, approvedBy);
    res.json(result);
  } catch (err) {
    console.error('Error approving gatepass:', err);
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/gatepass/:id/gate
 * Check-out or check-in an employee (CISF only)
 */
router.post('/:id/gate', requireAuth, requireRole(['CISF']), async (req, res) => {
  try {
    const id = req.params.id;
    const { action } = req.body; // 'check-out' or 'check-in'

    const result = await gatepassService.updateGateStatus(id, action);
    res.json(result);
  } catch (err) {
    console.error('Error updating gate status for gatepass:', err);
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/gatepass/report
 * Fetch filtered gatepasses for reporting (Supervisor and Security only)
 */
router.get('/report', requireAuth, requireRole(['E1', 'EL', 'CISF']), async (req, res) => {
  try {
    const { empId, status, startDate, endDate } = req.query;
    const gatepassDao = require('../dao/gatepassDao');
    const passes = await gatepassDao.findFiltered({ empId, status, startDate, endDate });
    res.json(passes);
  } catch (err) {
    console.error('Error fetching gatepass report:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
