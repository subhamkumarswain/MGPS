const { getConnection, closeConnection } = require('../config/database');

class UserDao {
  constructor() {
    this.INSERT_USER_SQL = `
      INSERT INTO MGPS_USERS (EMP_ID, NAME, DESIGNATION, PASSWORD_HASH, SALT, DEPT_CODE) 
      VALUES (:empId, :name, :designation, :passwordHash, :salt, :deptCode)
    `;
    this.FIND_USER_SQL = `
      SELECT EMP_ID, NAME, DESIGNATION, DEPT_CODE, PASSWORD_HASH, SALT, CREATED_AT 
      FROM MGPS_USERS WHERE EMP_ID = :empId
    `;
    this.FIND_ROLE_IDS_SQL = `
      SELECT ROLE_ID FROM MGPS_ROLES WHERE ROLE_NAME = :roleName
    `;
    this.INSERT_USER_ROLE_SQL = `
      INSERT INTO MGPS_USER_ROLES (EMP_ID, ROLE_ID) VALUES (:empId, :roleId)
    `;
    this.FIND_ROLES_SQL = `
      SELECT r.ROLE_NAME FROM MGPS_ROLES r 
      JOIN MGPS_USER_ROLES ur ON r.ROLE_ID = ur.ROLE_ID 
      WHERE ur.EMP_ID = :empId
    `;
  }

  async existsById(empId) {
    let conn;
    try {
      conn = await getConnection();
      const result = await conn.execute(
        'SELECT 1 FROM MGPS_USERS WHERE EMP_ID = :empId',
        { empId: empId }
      );
      return result.rows && result.rows.length > 0;
    } catch (err) {
      console.error('Error checking if user exists:', err);
      throw err;
    } finally {
      if (conn) {
        await closeConnection(conn);
      }
    }
  }

  async findById(empId) {
    let conn;
    try {
      conn = await getConnection();
      const result = await conn.execute(
        this.FIND_USER_SQL,
        { empId: empId }
      );

      if (!result.rows || result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      const user = {
        empId: row[0],
        name: row[1],
        designation: row[2],
        deptCode: row[3],
        passwordHash: row[4],
        salt: row[5],
        createdAt: row[6],
        roles: []
      };

      // Load roles
      user.roles = await this.loadRoles(empId, conn);
      return user;
    } catch (err) {
      console.error('Error finding user:', err);
      throw err;
    } finally {
      if (conn) {
        await closeConnection(conn);
      }
    }
  }

  async save(user) {
    let conn;
    try {
      conn = await getConnection();

      // Insert user within an explicit transaction
      const insertBinds = {
        empId: user.empId,
        name: user.name,
        designation: user.designation,
        passwordHash: user.passwordHash,
        salt: user.salt,
        deptCode: user.deptCode
      };
      console.log('Executing user insert SQL:', this.INSERT_USER_SQL.trim());
      console.log('Insert binds:', insertBinds);
      await conn.execute(
        this.INSERT_USER_SQL,
        insertBinds,
        { autoCommit: false }
      );

      // Assign roles
      if (user.roles && user.roles.length > 0) {
        await this.assignRoles(user.empId, user.roles, conn);
      }

      // Commit transaction
      await conn.commit();
    } catch (err) {
      if (conn) {
        await conn.rollback();
      }
      console.error('Error saving user:', err);
      throw err;
    } finally {
      if (conn) {
        await closeConnection(conn);
      }
    }
  }

  async assignRoles(empId, roles, conn) {
    try {
      for (const role of roles) {
        const roleId = await this.findRoleId(role, conn);
        if (roleId > 0) {
          await conn.execute(
            this.INSERT_USER_ROLE_SQL,
            { empId: empId, roleId: roleId }
          );
        }
      }
    } catch (err) {
      console.error('Error assigning roles:', err);
      throw err;
    }
  }

  async findRoleId(roleName, conn) {
    try {
      const result = await conn.execute(
        this.FIND_ROLE_IDS_SQL,
        { roleName: roleName }
      );
      if (result.rows && result.rows.length > 0) {
        return result.rows[0][0];
      }
      return -1;
    } catch (err) {
      console.error('Error finding role ID:', err);
      throw err;
    }
  }

  async loadRoles(empId, conn) {
    try {
      const result = await conn.execute(
        this.FIND_ROLES_SQL,
        { empId: empId }
      );
      if (result.rows && result.rows.length > 0) {
        return result.rows.map(row => row[0]);
      }
      return [];
    } catch (err) {
      console.error('Error loading roles:', err);
      throw err;
    }
  }

  async findAll() {
    let conn;
    try {
      conn = await getConnection();
      const result = await conn.execute(
        `SELECT EMP_ID, NAME, DESIGNATION, DEPT_CODE, CREATED_AT 
         FROM MGPS_USERS ORDER BY NAME ASC`
      );
      if (!result.rows) return [];
      const users = [];
      for (const row of result.rows) {
        const empId = row[0];
        const user = {
          empId: empId,
          name: row[1],
          designation: row[2],
          deptCode: row[3],
          createdAt: row[4],
          roles: []
        };
        user.roles = await this.loadRoles(empId, conn);
        users.push(user);
      }
      return users;
    } catch (err) {
      console.error('Error finding all users:', err);
      throw err;
    } finally {
      if (conn) {
        await closeConnection(conn);
      }
    }
  }

  async updateProfile(empId, designation, deptCode) {
    let conn;
    try {
      conn = await getConnection();
      const sql = `
        UPDATE MGPS_USERS 
        SET DESIGNATION = :designation, DEPT_CODE = :deptCode 
        WHERE EMP_ID = :empId
      `;
      await conn.execute(sql, { empId, designation, deptCode }, { autoCommit: true });
    } catch (err) {
      console.error('Error updating user profile:', err);
      throw err;
    } finally {
      if (conn) {
        await closeConnection(conn);
      }
    }
  }

  async clearRoles(empId, conn) {
    try {
      await conn.execute(
        'DELETE FROM MGPS_USER_ROLES WHERE EMP_ID = :empId',
        { empId: empId }
      );
    } catch (err) {
      console.error('Error clearing user roles:', err);
      throw err;
    }
  }

  async delete(empId) {
    let conn;
    try {
      conn = await getConnection();
      await conn.execute(
        'DELETE FROM MGPS_USERS WHERE EMP_ID = :empId',
        { empId: empId },
        { autoCommit: true }
      );
    } catch (err) {
      console.error('Error deleting user:', err);
      throw err;
    } finally {
      if (conn) {
        await closeConnection(conn);
      }
    }
  }
}

module.exports = new UserDao();
