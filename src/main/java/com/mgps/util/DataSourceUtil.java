package com.mgps.util;

import java.sql.Connection;

public class DataSourceUtil {
    public static Connection getConnection() throws Exception {
        return DbConnectionFactory.getConnection();
    }
}
