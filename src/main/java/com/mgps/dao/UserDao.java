package com.mgps.dao;

import com.mgps.model.User;
import com.mgps.util.DbConnectionFactory;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class UserDao {
    private static final String INSERT_USER_SQL =
            "INSERT INTO MGPS_USERS (EMP_ID, NAME, DESIGNATION, PASSWORD_HASH, SALT, DEPT_CODE) VALUES (?, ?, ?, ?, ?, ?)";
    private static final String FIND_USER_SQL =
            "SELECT EMP_ID, NAME, DESIGNATION, DEPT_CODE, PASSWORD_HASH, SALT, CREATED_AT FROM MGPS_USERS WHERE EMP_ID = ?";
    private static final String FIND_ROLE_IDS_SQL =
            "SELECT ROLE_ID FROM MGPS_ROLES WHERE ROLE_NAME = ?";
    private static final String INSERT_USER_ROLE_SQL =
            "INSERT INTO MGPS_USER_ROLES (EMP_ID, ROLE_ID) VALUES (?, ?)";
    private static final String FIND_ROLES_SQL =
            "SELECT r.ROLE_NAME FROM MGPS_ROLES r JOIN MGPS_USER_ROLES ur ON r.ROLE_ID = ur.ROLE_ID WHERE ur.EMP_ID = ?";

    public boolean existsById(String empId) throws Exception {
        String sql = "SELECT 1 FROM MGPS_USERS WHERE EMP_ID = ?";
        try (Connection conn = DbConnectionFactory.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, empId);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next();
            }
        }
    }

    public Optional<User> findById(String empId) throws Exception {
        try (Connection conn = DbConnectionFactory.getConnection();
             PreparedStatement ps = conn.prepareStatement(FIND_USER_SQL)) {
            ps.setString(1, empId);
            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) {
                    return Optional.empty();
                }
                User user = new User();
                user.setEmpId(rs.getString("EMP_ID"));
                user.setName(rs.getString("NAME"));
                user.setDesignation(rs.getString("DESIGNATION"));
                user.setDeptCode(rs.getString("DEPT_CODE"));
                user.setPasswordHash(rs.getString("PASSWORD_HASH"));
                user.setSalt(rs.getString("SALT"));
                user.setCreatedAt(rs.getTimestamp("CREATED_AT").toLocalDateTime());
                user.setRoles(loadRoles(empId, conn));
                return Optional.of(user);
            }
        }
    }

    public void save(User user) throws Exception {
        try (Connection conn = DbConnectionFactory.getConnection()) {
            conn.setAutoCommit(false);
            try (PreparedStatement ps = conn.prepareStatement(INSERT_USER_SQL)) {
                ps.setString(1, user.getEmpId());
                ps.setString(2, user.getName());
                ps.setString(3, user.getDesignation());
                ps.setString(4, user.getPasswordHash());
                ps.setString(5, user.getSalt());
                ps.setString(6, user.getDeptCode());
                ps.executeUpdate();
            }
            assignRoles(user.getEmpId(), user.getRoles(), conn);
            conn.commit();
        }
    }

    private void assignRoles(String empId, List<String> roles, Connection conn) throws Exception {
        if (roles == null || roles.isEmpty()) {
            return;
        }
        for (String role : roles) {
            int roleId = findRoleId(role, conn);
            if (roleId > 0) {
                try (PreparedStatement ps = conn.prepareStatement(INSERT_USER_ROLE_SQL)) {
                    ps.setString(1, empId);
                    ps.setInt(2, roleId);
                    ps.executeUpdate();
                }
            }
        }
    }

    private int findRoleId(String roleName, Connection conn) throws Exception {
        try (PreparedStatement ps = conn.prepareStatement(FIND_ROLE_IDS_SQL)) {
            ps.setString(1, roleName);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt("ROLE_ID");
                }
                return -1;
            }
        }
    }

    private List<String> loadRoles(String empId, Connection conn) throws Exception {
        List<String> roles = new ArrayList<>();
        try (PreparedStatement ps = conn.prepareStatement(FIND_ROLES_SQL)) {
            ps.setString(1, empId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    roles.add(rs.getString("ROLE_NAME"));
                }
            }
        }
        return roles;
    }
}
