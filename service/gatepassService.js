const gatepassDao = require('../dao/gatepassDao');

class GatepassService {
  async applyGatepass(empId, gatepassType, reason, outTime, inTime) {
    if (!gatepassType || !reason) {
      throw new Error('Gatepass type and reason are required');
    }
    const gatepass = {
      empId,
      gatepassType,
      reason,
      outTime,
      inTime,
      status: 'PENDING'
    };
    await gatepassDao.create(gatepass);
    return { success: true, message: 'Gatepass requested successfully' };
  }

  async getMyGatepasses(empId) {
    return await gatepassDao.findByEmpId(empId);
  }

  async getPendingGatepasses() {
    return await gatepassDao.findPending();
  }

  async getApprovedGatepasses() {
    return await gatepassDao.findApproved();
  }

  async approveGatepass(id, status, approvedByEmpId) {
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      throw new Error('Invalid status update. Must be APPROVED or REJECTED');
    }
    const gatepass = await gatepassDao.findById(id);
    if (!gatepass) {
      throw new Error('Gatepass not found');
    }
    if (gatepass.status !== 'PENDING') {
      throw new Error('Only PENDING gatepasses can be approved or rejected');
    }
    await gatepassDao.updateStatus(id, status, approvedByEmpId);
    return { success: true, message: `Gatepass ${status.toLowerCase()} successfully` };
  }

  async updateGateStatus(id, action) {
    if (!['check-out', 'check-in'].includes(action)) {
      throw new Error('Invalid gate action. Must be check-out or check-in');
    }
    const gatepass = await gatepassDao.findById(id);
    if (!gatepass) {
      throw new Error('Gatepass not found');
    }

    if (action === 'check-out') {
      if (gatepass.status !== 'APPROVED') {
        throw new Error('Only APPROVED gatepasses can be checked out');
      }
      await gatepassDao.updateStatus(id, 'OUT');
      return { success: true, message: 'Employee checked out successfully' };
    } else {
      if (gatepass.status !== 'OUT') {
        throw new Error('Only checked OUT employees can be checked in');
      }
      await gatepassDao.updateStatus(id, 'IN');
      return { success: true, message: 'Employee checked in successfully' };
    }
  }
}

module.exports = new GatepassService();
