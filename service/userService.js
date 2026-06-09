const userDao = require('../dao/userDao');
const passwordUtil = require('../utils/passwordUtil');
const { getConnection, closeConnection } = require('../config/database');

class UserService {
  
  async userExists(empId) {
    try {
      return await userDao.existsById(empId);
    } catch (err) {
      console.error('Error checking user existence:', err);
      throw err;
    }
  }

  async register(empId, name, designation, deptCode, password, roles) {
    try {
      const salt = passwordUtil.generateSalt();
      const hash = await passwordUtil.hashPassword(password, salt);
      
      const user = {
        empId: empId,
        name: name,
        designation: designation,
        deptCode: deptCode,
        passwordHash: hash,
        salt: salt,
        roles: roles || []
      };

      await userDao.save(user);
      return { success: true, message: 'User registered successfully' };
    } catch (err) {
      console.error('Error registering user:', err);
      throw err;
    }
  }

  async authenticate(empId, password) {
    try {
      const user = await userDao.findById(empId);
      if (!user) {
        return null;
      }

      const isValid = await passwordUtil.verifyPassword(password, user.salt, user.passwordHash);
      if (isValid) {
        return {
          empId: user.empId,
          name: user.name,
          designation: user.designation,
          deptCode: user.deptCode,
          roles: user.roles
        };
      }
      return null;
    } catch (err) {
      console.error('Error authenticating user:', err);
      throw err;
    }
  }

  async getAllUsers() {
    try {
      return await userDao.findAll();
    } catch (err) {
      console.error('Error in service finding all users:', err);
      throw err;
    }
  }

  async updateUserProfile(empId, designation, deptCode) {
    try {
      await userDao.updateProfile(empId, designation, deptCode);
      return { success: true, message: 'User profile updated successfully' };
    } catch (err) {
      console.error('Error in service updating profile:', err);
      throw err;
    }
  }

  async updateUserRoles(empId, roles) {
    let conn;
    try {
      conn = await getConnection();
      // Clear roles
      await userDao.clearRoles(empId, conn);
      // Assign new roles
      if (roles && roles.length > 0) {
        await userDao.assignRoles(empId, roles, conn);
      }
      await conn.commit();
      return { success: true, message: 'User roles updated successfully' };
    } catch (err) {
      if (conn) {
        await conn.rollback();
      }
      console.error('Error in service updating user roles:', err);
      throw err;
    } finally {
      if (conn) {
        await closeConnection(conn);
      }
    }
  }

  async deleteUser(empId) {
    try {
      await userDao.delete(empId);
      return { success: true, message: 'User deleted successfully' };
    } catch (err) {
      console.error('Error in service deleting user:', err);
      throw err;
    }
  }
}

module.exports = new UserService();
