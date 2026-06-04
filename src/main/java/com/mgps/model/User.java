package com.mgps.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class User {
    private String empId;
    private String name;
    private String designation;
    private String deptCode;
    private String passwordHash;
    private String salt;
    private LocalDateTime createdAt;
    private List<String> roles = new ArrayList<>();

    public User() {
    }

    public User(String empId, String name, String designation, String deptCode, String passwordHash, String salt) {
        this.empId = empId;
        this.name = name;
        this.designation = designation;
        this.deptCode = deptCode;
        this.passwordHash = passwordHash;
        this.salt = salt;
        this.createdAt = LocalDateTime.now();
    }

    public String getEmpId() {
        return empId;
    }

    public void setEmpId(String empId) {
        this.empId = empId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public String getDeptCode() {
        return deptCode;
    }

    public void setDeptCode(String deptCode) {
        this.deptCode = deptCode;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getSalt() {
        return salt;
    }

    public void setSalt(String salt) {
        this.salt = salt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<String> getRoles() {
        return Collections.unmodifiableList(roles);
    }

    public void setRoles(List<String> roles) {
        this.roles = new ArrayList<>(roles);
    }

    public void addRole(String role) {
        if (!roles.contains(role)) {
            roles.add(role);
        }
    }
}
