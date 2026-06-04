package com.mgps.service;

import com.mgps.dao.UserDao;
import com.mgps.model.User;
import com.mgps.util.PasswordUtil;
import java.util.List;
import java.util.Optional;

public class UserService {
    private final UserDao userDao = new UserDao();

    public boolean userExists(String empId) throws Exception {
        return userDao.existsById(empId);
    }

    public void register(String empId, String name, String designation, String deptCode, String password, List<String> roles) throws Exception {
        String salt = PasswordUtil.generateSalt();
        String hash = PasswordUtil.hashPassword(password.toCharArray(), salt);
        User user = new User(empId, name, designation, deptCode, hash, salt);
        if (roles != null) {
            user.setRoles(roles);
        }
        userDao.save(user);
    }

    public Optional<User> authenticate(String empId, String password) throws Exception {
        Optional<User> user = userDao.findById(empId);
        if (user.isEmpty()) {
            return Optional.empty();
        }
        User found = user.get();
        boolean valid = PasswordUtil.verifyPassword(password.toCharArray(), found.getSalt(), found.getPasswordHash());
        return valid ? Optional.of(found) : Optional.empty();
    }
}
