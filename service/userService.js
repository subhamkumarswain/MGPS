const userDao = require('../dao/userDao');
const passwordUtil = require('../utils/passwordUtil');

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
}

module.exports = new UserService();
