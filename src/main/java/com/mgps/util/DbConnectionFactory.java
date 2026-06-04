package com.mgps.util;

import java.sql.Connection;
import java.sql.DriverManager;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;

public class DbConnectionFactory {
    private static final String DEFAULT_JDBC_URL = "jdbc:oracle:thin:@//localhost:1521/XE";
    private static final String DEFAULT_USER = "mgps_app";
    private static final String DEFAULT_PASSWORD = "mgps_password";
    private static DataSource dataSource;

    static {
        dataSource = lookupJndiDataSource();
    }

    private static DataSource lookupJndiDataSource() {
        try {
            InitialContext ic = new InitialContext();
            return (DataSource) ic.lookup("java:comp/env/jdbc/MGPS");
        } catch (NamingException e) {
            return null;
        }
    }

    public static Connection getConnection() throws Exception {
        if (dataSource != null) {
            return dataSource.getConnection();
        }
        String url = getSetting("MGPS_JDBC_URL", DEFAULT_JDBC_URL);
        String user = getSetting("MGPS_JDBC_USER", DEFAULT_USER);
        String password = getSetting("MGPS_JDBC_PASSWORD", DEFAULT_PASSWORD);
        Class.forName("oracle.jdbc.OracleDriver");
        return DriverManager.getConnection(url, user, password);
    }

    private static String getSetting(String key, String defaultValue) {
        String value = System.getProperty(key);
        if (value != null && !value.isBlank()) {
            return value;
        }
        value = System.getenv(key);
        if (value != null && !value.isBlank()) {
            return value;
        }
        return defaultValue;
    }
}
