const express = require('express');
const router = express.Router();
const materialPassService = require('../service/materialPassService');

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
 * POST /api/materialpass
 * Apply for a new material pass
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { materialDesc, quantity, passType, outTime, returnTime } = req.body;
    const empId = req.session.user.empId;

    const result = await materialPassService.applyMaterialPass(empId, materialDesc, quantity, passType, outTime, returnTime);
    res.status(201).json(result);
  } catch (err) {
    console.error('Error applying for material pass:', err);
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/materialpass/my
 * View logged-in employee's material passes
 */
router.get('/my', requireAuth, async (req, res) => {
  try {
    const empId = req.session.user.empId;
    const passes = await materialPassService.getMyMaterialPasses(empId);
    res.json(passes);
  } catch (err) {
    console.error('Error getting my material passes:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/materialpass/pending
 * View pending material passes (Supervisor only: E1 or EL)
 */
router.get('/pending', requireAuth, requireRole(['E1', 'EL']), async (req, res) => {
  try {
    const passes = await materialPassService.getPendingMaterialPasses();
    res.json(passes);
  } catch (err) {
    console.error('Error getting pending material passes:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/materialpass/approved
 * View approved material passes for security checks (CISF only)
 */
router.get('/approved', requireAuth, requireRole(['CISF']), async (req, res) => {
  try {
    const passes = await materialPassService.getApprovedMaterialPasses();
    res.json(passes);
  } catch (err) {
    console.error('Error getting approved material passes:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/materialpass/:id/approve
 * Approve or Reject a material pass (Supervisor only: E1 or EL)
 */
router.post('/:id/approve', requireAuth, requireRole(['E1', 'EL']), async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body; // 'APPROVED' or 'REJECTED'
    const approvedBy = req.session.user.empId;

    const result = await materialPassService.approveMaterialPass(id, status, approvedBy);
    res.json(result);
  } catch (err) {
    console.error('Error approving material pass:', err);
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/materialpass/:id/gate
 * Check-out or mark returned (CISF only)
 */
router.post('/:id/gate', requireAuth, requireRole(['CISF']), async (req, res) => {
  try {
    const id = req.params.id;
    const { action } = req.body; // 'check-out' or 'return'

    const result = await materialPassService.updateGateStatus(id, action);
    res.json(result);
  } catch (err) {
    console.error('Error updating gate status for material pass:', err);
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/materialpass/report
 * Fetch filtered material passes for reporting (Supervisor and Security only)
 */
router.get('/report', requireAuth, requireRole(['E1', 'EL', 'CISF']), async (req, res) => {
  try {
    const { empId, status, passType, startDate, endDate } = req.query;
    const materialPassDao = require('../dao/materialPassDao');
    const passes = await materialPassDao.findFiltered({ empId, status, passType, startDate, endDate });
    res.json(passes);
  } catch (err) {
    console.error('Error fetching material pass report:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
