const { getConnection, closeConnection } = require('../config/database');

class MaterialPassDao {
  async create(pass) {
    let conn;
    try {
      conn = await getConnection();
      const sql = `
        INSERT INTO MGPS_MATERIAL_PASSES (EMP_ID, MATERIAL_DESC, QUANTITY, PASS_TYPE, OUT_TIME, RETURN_TIME, STATUS)
        VALUES (:empId, :materialDesc, :quantity, :passType, :outTime, :returnTime, :status)
      `;
      const binds = {
        empId: pass.empId,
        materialDesc: pass.materialDesc,
        quantity: parseInt(pass.quantity, 10),
        passType: pass.passType,
        outTime: pass.outTime ? new Date(pass.outTime) : null,
        returnTime: pass.returnTime ? new Date(pass.returnTime) : null,
        status: pass.status || 'PENDING'
      };
      await conn.execute(sql, binds, { autoCommit: true });
    } catch (err) {
      console.error('Error creating material pass:', err);
      throw err;
    } finally {
      if (conn) {
        await closeConnection(conn);
      }
    }
  }

  async findById(id) {
    let conn;
    try {
      conn = await getConnection();
      const sql = `
        SELECT PASS_ID, EMP_ID, MATERIAL_DESC, QUANTITY, PASS_TYPE, OUT_TIME, RETURN_TIME, STATUS, APPROVED_BY, CREATED_AT
        FROM MGPS_MATERIAL_PASSES
        WHERE PASS_ID = :id
      `;
      const result = await conn.execute(sql, { id: id });
      if (!result.rows || result.rows.length === 0) {
        return null;
      }
      return this._mapRow(result.rows[0]);
    } catch (err) {
      console.error('Error finding material pass by ID:', err);
      throw err;
    } finally {
      if (conn) {
        await closeConnection(conn);
      }
    }
  }

  async findByEmpId(empId) {
    let conn;
    try {
      conn = await getConnection();
      const sql = `
        SELECT PASS_ID, EMP_ID, MATERIAL_DESC, QUANTITY, PASS_TYPE, OUT_TIME, RETURN_TIME, STATUS, APPROVED_BY, CREATED_AT
        FROM MGPS_MATERIAL_PASSES
        WHERE EMP_ID = :empId
        ORDER BY CREATED_AT DESC
      `;
      const result = await conn.execute(sql, { empId: empId });
      if (!result.rows) return [];
      return result.rows.map(row => this._mapRow(row));
    } catch (err) {
      console.error('Error finding material passes by employee ID:', err);
      throw err;
    } finally {
      if (conn) {
        await closeConnection(conn);
      }
    }
  }

  async findPending() {
    let conn;
    try {
      conn = await getConnection();
      const sql = `
        SELECT m.PASS_ID, m.EMP_ID, m.MATERIAL_DESC, m.QUANTITY, m.PASS_TYPE, m.OUT_TIME, m.RETURN_TIME, m.STATUS, m.APPROVED_BY, m.CREATED_AT, u.NAME
        FROM MGPS_MATERIAL_PASSES m
        JOIN MGPS_USERS u ON m.EMP_ID = u.EMP_ID
        WHERE m.STATUS = 'PENDING'
        ORDER BY m.CREATED_AT ASC
      `;
      const result = await conn.execute(sql);
      if (!result.rows) return [];
      return result.rows.map(row => {
        const pass = this._mapRow(row);
        pass.empName = row[10];
        return pass;
      });
    } catch (err) {
      console.error('Error finding pending material passes:', err);
      throw err;
    } finally {
      if (conn) {
        await closeConnection(conn);
      }
    }
  }

  async findApproved() {
    let conn;
    try {
      conn = await getConnection();
      const sql = `
        SELECT m.PASS_ID, m.EMP_ID, m.MATERIAL_DESC, m.QUANTITY, m.PASS_TYPE, m.OUT_TIME, m.RETURN_TIME, m.STATUS, m.APPROVED_BY, m.CREATED_AT, u.NAME
        FROM MGPS_MATERIAL_PASSES m
        JOIN MGPS_USERS u ON m.EMP_ID = u.EMP_ID
        WHERE m.STATUS IN ('APPROVED', 'OUT', 'RETURNED')
        ORDER BY m.CREATED_AT DESC
      `;
      const result = await conn.execute(sql);
      if (!result.rows) return [];
      return result.rows.map(row => {
        const pass = this._mapRow(row);
        pass.empName = row[10];
        return pass;
      });
    } catch (err) {
      console.error('Error finding approved/active material passes:', err);
      throw err;
    } finally {
      if (conn) {
        await closeConnection(conn);
      }
    }
  }

  async updateStatus(id, status, approvedBy = null) {
    let conn;
    try {
      conn = await getConnection();
      const sql = `
        UPDATE MGPS_MATERIAL_PASSES
        SET STATUS = :status, APPROVED_BY = COALESCE(:approvedBy, APPROVED_BY)
        WHERE PASS_ID = :id
      `;
      await conn.execute(sql, { id: id, status: status, approvedBy: approvedBy }, { autoCommit: true });
    } catch (err) {
      console.error('Error updating material pass status:', err);
      throw err;
    } finally {
      if (conn) {
        await closeConnection(conn);
      }
    }
  }

  async findFiltered(filters = {}) {
    let conn;
    try {
      conn = await getConnection();
      let sql = `
        SELECT m.PASS_ID, m.EMP_ID, m.MATERIAL_DESC, m.QUANTITY, m.PASS_TYPE, m.OUT_TIME, m.RETURN_TIME, m.STATUS, m.APPROVED_BY, m.CREATED_AT, u.NAME
        FROM MGPS_MATERIAL_PASSES m
        JOIN MGPS_USERS u ON m.EMP_ID = u.EMP_ID
        WHERE 1 = 1
      `;
      const binds = {};
      
      if (filters.empId) {
        sql += ` AND m.EMP_ID = :empId`;
        binds.empId = filters.empId;
      }
      if (filters.status) {
        sql += ` AND m.STATUS = :status`;
        binds.status = filters.status;
      }
      if (filters.passType) {
        sql += ` AND m.PASS_TYPE = :passType`;
        binds.passType = filters.passType;
      }
      if (filters.startDate) {
        sql += ` AND m.CREATED_AT >= :startDate`;
        binds.startDate = new Date(filters.startDate);
      }
      if (filters.endDate) {
        const eDate = new Date(filters.endDate);
        eDate.setHours(23, 59, 59, 999);
        sql += ` AND m.CREATED_AT <= :endDate`;
        binds.endDate = eDate;
      }
      
      sql += ` ORDER BY m.CREATED_AT DESC`;
      
      const result = await conn.execute(sql, binds);
      if (!result.rows) return [];
      return result.rows.map(row => {
        const pass = this._mapRow(row);
        pass.empName = row[10];
        return pass;
      });
    } catch (err) {
      console.error('Error finding filtered material passes:', err);
      throw err;
    } finally {
      if (conn) {
        await closeConnection(conn);
      }
    }
  }

  _mapRow(row) {
    return {
      passId: row[0],
      empId: row[1],
      materialDesc: row[2],
      quantity: row[3],
      passType: row[4],
      outTime: row[5],
      returnTime: row[6],
      status: row[7],
      approvedBy: row[8],
      createdAt: row[9]
    };
  }
}

module.exports = new MaterialPassDao();
