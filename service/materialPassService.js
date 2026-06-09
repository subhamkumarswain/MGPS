const materialPassDao = require('../dao/materialPassDao');

class MaterialPassService {
  async applyMaterialPass(empId, materialDesc, quantity, passType, outTime, returnTime) {
    if (!materialDesc || !quantity || !passType) {
      throw new Error('Material description, quantity, and pass type are required');
    }
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      throw new Error('Quantity must be a positive number');
    }
    const pass = {
      empId,
      materialDesc,
      quantity: qty,
      passType,
      outTime,
      returnTime,
      status: 'PENDING'
    };
    await materialPassDao.create(pass);
    return { success: true, message: 'Material pass requested successfully' };
  }

  async getMyMaterialPasses(empId) {
    return await materialPassDao.findByEmpId(empId);
  }

  async getPendingMaterialPasses() {
    return await materialPassDao.findPending();
  }

  async getApprovedMaterialPasses() {
    return await materialPassDao.findApproved();
  }

  async approveMaterialPass(id, status, approvedByEmpId) {
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      throw new Error('Invalid status update. Must be APPROVED or REJECTED');
    }
    const pass = await materialPassDao.findById(id);
    if (!pass) {
      throw new Error('Material pass not found');
    }
    if (pass.status !== 'PENDING') {
      throw new Error('Only PENDING material passes can be approved or rejected');
    }
    await materialPassDao.updateStatus(id, status, approvedByEmpId);
    return { success: true, message: `Material pass ${status.toLowerCase()} successfully` };
  }

  async updateGateStatus(id, action) {
    if (!['check-out', 'return'].includes(action)) {
      throw new Error('Invalid gate action. Must be check-out or return');
    }
    const pass = await materialPassDao.findById(id);
    if (!pass) {
      throw new Error('Material pass not found');
    }

    if (action === 'check-out') {
      if (pass.status !== 'APPROVED') {
        throw new Error('Only APPROVED material passes can be checked out');
      }
      await materialPassDao.updateStatus(id, 'OUT');
      return { success: true, message: 'Material checked out successfully' };
    } else {
      if (pass.status !== 'OUT') {
        throw new Error('Only checked OUT material can be returned');
      }
      await materialPassDao.updateStatus(id, 'RETURNED');
      return { success: true, message: 'Material return logged successfully' };
    }
  }
}

module.exports = new MaterialPassService();
