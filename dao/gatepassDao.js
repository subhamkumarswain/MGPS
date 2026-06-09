const { getConnection, closeConnection } = require('../config/database');

class GatepassDao {
  async create(gatepass) {
    let conn;
    try {
      conn = await getConnection();
      const sql = `
        INSERT INTO MGPS_GATEPASSES (EMP_ID, GATEPASS_TYPE, REASON, OUT_TIME, IN_TIME, STATUS)
        VALUES (:empId, :gatepassType, :reason, :outTime, :inTime, :status)
      `;
      const binds = {
        empId: gatepass.empId,
        gatepassType: gatepass.gatepassType,
        reason: gatepass.reason,
        outTime: gatepass.outTime ? new Date(gatepass.outTime) : null,
        inTime: gatepass.inTime ? new Date(gatepass.inTime) : null,
        status: gatepass.status || 'PENDING'
      };
      await conn.execute(sql, binds, { autoCommit: true });
    } catch (err) {
      console.error('Error creating gatepass:', err);
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
        SELECT GATEPASS_ID, EMP_ID, GATEPASS_TYPE, REASON, OUT_TIME, IN_TIME, STATUS, APPROVED_BY, CREATED_AT
        FROM MGPS_GATEPASSES
        WHERE GATEPASS_ID = :id
      `;
      const result = await conn.execute(sql, { id: id });
      if (!result.rows || result.rows.length === 0) {
        return null;
      }
      return this._mapRow(result.rows[0]);
    } catch (err) {
      console.error('Error finding gatepass by ID:', err);
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
        SELECT GATEPASS_ID, EMP_ID, GATEPASS_TYPE, REASON, OUT_TIME, IN_TIME, STATUS, APPROVED_BY, CREATED_AT
        FROM MGPS_GATEPASSES
        WHERE EMP_ID = :empId
        ORDER BY CREATED_AT DESC
      `;
      const result = await conn.execute(sql, { empId: empId });
      if (!result.rows) return [];
      return result.rows.map(row => this._mapRow(row));
    } catch (err) {
      console.error('Error finding gatepasses by employee ID:', err);
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
        SELECT g.GATEPASS_ID, g.EMP_ID, g.GATEPASS_TYPE, g.REASON, g.OUT_TIME, g.IN_TIME, g.STATUS, g.APPROVED_BY, g.CREATED_AT, u.NAME
        FROM MGPS_GATEPASSES g
        JOIN MGPS_USERS u ON g.EMP_ID = u.EMP_ID
        WHERE g.STATUS = 'PENDING'
        ORDER BY g.CREATED_AT ASC
      `;
      const result = await conn.execute(sql);
      if (!result.rows) return [];
      return result.rows.map(row => {
        const pass = this._mapRow(row);
        pass.empName = row[9];
        return pass;
      });
    } catch (err) {
      console.error('Error finding pending gatepasses:', err);
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
        SELECT g.GATEPASS_ID, g.EMP_ID, g.GATEPASS_TYPE, g.REASON, g.OUT_TIME, g.IN_TIME, g.STATUS, g.APPROVED_BY, g.CREATED_AT, u.NAME
        FROM MGPS_GATEPASSES g
        JOIN MGPS_USERS u ON g.EMP_ID = u.EMP_ID
        WHERE g.STATUS IN ('APPROVED', 'OUT', 'IN')
        ORDER BY g.CREATED_AT DESC
      `;
      const result = await conn.execute(sql);
      if (!result.rows) return [];
      return result.rows.map(row => {
        const pass = this._mapRow(row);
        pass.empName = row[9];
        return pass;
      });
    } catch (err) {
      console.error('Error finding approved/active gatepasses:', err);
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
        UPDATE MGPS_GATEPASSES
        SET STATUS = :status, APPROVED_BY = COALESCE(:approvedBy, APPROVED_BY)
        WHERE GATEPASS_ID = :id
      `;
      await conn.execute(sql, { id: id, status: status, approvedBy: approvedBy }, { autoCommit: true });
    } catch (err) {
      console.error('Error updating gatepass status:', err);
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
        SELECT g.GATEPASS_ID, g.EMP_ID, g.GATEPASS_TYPE, g.REASON, g.OUT_TIME, g.IN_TIME, g.STATUS, g.APPROVED_BY, g.CREATED_AT, u.NAME
        FROM MGPS_GATEPASSES g
        JOIN MGPS_USERS u ON g.EMP_ID = u.EMP_ID
        WHERE 1 = 1
      `;
      const binds = {};
      
      if (filters.empId) {
        sql += ` AND g.EMP_ID = :empId`;
        binds.empId = filters.empId;
      }
      if (filters.status) {
        sql += ` AND g.STATUS = :status`;
        binds.status = filters.status;
      }
      if (filters.startDate) {
        sql += ` AND g.CREATED_AT >= :startDate`;
        binds.startDate = new Date(filters.startDate);
      }
      if (filters.endDate) {
        // Add 23 hours 59 minutes to cover the whole end date
        const eDate = new Date(filters.endDate);
        eDate.setHours(23, 59, 59, 999);
        sql += ` AND g.CREATED_AT <= :endDate`;
        binds.endDate = eDate;
      }
      
      sql += ` ORDER BY g.CREATED_AT DESC`;
      
      const result = await conn.execute(sql, binds);
      if (!result.rows) return [];
      return result.rows.map(row => {
        const pass = this._mapRow(row);
        pass.empName = row[9];
        return pass;
      });
    } catch (err) {
      console.error('Error finding filtered gatepasses:', err);
      throw err;
    } finally {
      if (conn) {
        await closeConnection(conn);
      }
    }
  }

  _mapRow(row) {
    return {
      gatepassId: row[0],
      empId: row[1],
      gatepassType: row[2],
      reason: row[3],
      outTime: row[4],
      inTime: row[5],
      status: row[6],
      approvedBy: row[7],
      createdAt: row[8]
    };
  }
}

module.exports = new GatepassDao();
