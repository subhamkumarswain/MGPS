package com.mgps.tools;

import java.io.BufferedReader;
import java.io.FileReader;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

/**
 * Simple SQL file runner that executes statements separated by semicolons.
 * Usage:
 *   java -cp .;ojdbc8.jar com.mgps.tools.SqlRunner jdbc:oracle:thin:@//localhost:1521/XE mgps_app mgps_password C:\path\to\mgps_schema.sql
 */
public class SqlRunner {
    public static void main(String[] args) throws Exception {
        if (args.length < 4) {
            System.err.println("Usage: SqlRunner <jdbcUrl> <dbUser> <dbPass> <sqlFile>");
            System.exit(2);
        }
        String jdbcUrl = args[0];
        String dbUser = args[1];
        String dbPass = args[2];
        String sqlFile = args[3];

        Class.forName("oracle.jdbc.OracleDriver");

        List<String> statements = loadSqlStatements(sqlFile);

        try (Connection conn = DriverManager.getConnection(jdbcUrl, dbUser, dbPass)) {
            conn.setAutoCommit(false);
            try (Statement st = conn.createStatement()) {
                for (String sql : statements) {
                    String trimmed = sql.trim();
                    if (trimmed.isEmpty()) continue;
                    System.out.println("Executing: " + (trimmed.length() > 80 ? trimmed.substring(0, 80) + "..." : trimmed));
                    st.execute(trimmed);
                }
            }
            conn.commit();
        }
        System.out.println("Finished executing SQL file.");
    }

    private static List<String> loadSqlStatements(String path) throws Exception {
        List<String> statements = new ArrayList<>();
        StringBuilder sb = new StringBuilder();
        boolean inBlockComment = false;
        try (BufferedReader r = new BufferedReader(new FileReader(path))) {
            String line;
            while ((line = r.readLine()) != null) {
                String t = line.trim();
                if (t.startsWith("--")) continue;
                if (t.startsWith("/*")) { inBlockComment = true; continue; }
                if (inBlockComment) {
                    if (t.endsWith("*/")) { inBlockComment = false; }
                    continue;
                }
                sb.append(line).append(' ');
                if (line.contains(";")) {
                    String[] parts = sb.toString().split(";");
                    // all except possibly last are complete statements
                    for (int i = 0; i < parts.length - 1; i++) {
                        statements.add(parts[i]);
                    }
                    sb = new StringBuilder(parts[parts.length - 1]);
                }
            }
            if (sb.length() > 0) {
                String last = sb.toString().trim();
                if (!last.isEmpty()) statements.add(last);
            }
        }
        return statements;
    }
}
