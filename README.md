# MGPS - Project Skeleton

This workspace contains frontend templates, database DDL and Java servlet examples for the MGPS application (NetBeans + Oracle XE).

Files added:

- `web/templates/home.html` - Home page template
- `web/templates/login.html` - Login page
- `web/templates/register.html` - Registration form
- `db/mgps_schema.sql` - Oracle DDL and sample role inserts
- `src/main/java/com/mgps/util/PasswordUtil.java` - PBKDF2 password helper
- `src/main/java/com/mgps/servlet/RegistrationServlet.java` - Registration servlet
- `src/main/java/com/mgps/servlet/LoginServlet.java` - Login servlet
- `src/main/java/com/mgps/model/User.java` - User domain model
- `src/main/java/com/mgps/dao/UserDao.java` - User database access object
- `src/main/java/com/mgps/service/UserService.java` - Registration and authentication service
- `src/main/java/com/mgps/util/DbConnectionFactory.java` - JDBC connection factory with JNDI and direct JDBC fallback
- `config/context.xml` - Sample DataSource (Tomcat)

Quick setup notes

1. Add Oracle JDBC driver (`ojdbc8.jar` or newer) to your NetBeans project libraries or place it in `libs/ojdbc8.jar` and build with the `with-ojdbc` profile.
2. Create the DB user and run `db/mgps_schema.sql` (as `mgps_app`).

Example commands (run in SQL*Plus or SQL Developer):

```sql
CREATE USER mgps_app IDENTIFIED BY mgps_password;
GRANT CONNECT, RESOURCE TO mgps_app;
-- connect mgps_app/mgps_password
-- @db/mgps_schema.sql
```

3. In NetBeans, create a web application, add the `src/main/java` classes to the project, and ensure servlet API (Jakarta/Javax) versions match your server.
4. For production, configure a container-managed DataSource and use connection pooling instead of DriverManager.

NetBeans integration steps (quick)

- Open NetBeans and choose "Open Project" and select the folder containing `pom.xml` (the project is a Maven WAR).
- You can also open the `nbproject` folder directly if you want the Ant-style NetBeans project wrapper.
- Ensure the target server (Tomcat, GlassFish) is configured in NetBeans and has the Oracle JDBC driver available in its `lib` folder (or add `ojdbc8.jar` to the project's `lib` if you prefer).
- Build the project (Right-click > Build). Deploy to the server (Right-click > Run).
- To use the JNDI DataSource, copy `src/main/webapp/META-INF/context.xml` into Tomcat's `conf/context.xml` or deploy the WAR (Tomcat will pick up the WAR's META-INF/context.xml).
- The frontend pages are now located at `src/main/webapp/home.html`, `src/main/webapp/login.html`, and `src/main/webapp/register.html`.

Using the JNDI DataSource

- The servlets now use a JNDI DataSource lookup at `java:comp/env/jdbc/MGPS` via `com.mgps.util.DataSourceUtil`.
- Ensure the DataSource is configured in Tomcat (drop `src/main/webapp/META-INF/context.xml` into the WAR or add the resource in `conf/context.xml`).

Build with local `ojdbc` in `libs`:

```bash
mvn -Dwith.ojdbc=true package
```

Place `ojdbc8.jar` inside `libs/ojdbc8.jar` before running the profile build.

Running the DDL

- Use `scripts/run-ddl.ps1` to create the DB user and run `db/mgps_schema.sql`. Edit the script if your `sqlplus` path or credentials differ.

Automated deployment

- Use `scripts/deploy-to-tomcat.ps1` to build the project and deploy the WAR to a Tomcat `webapps` directory. Example:

```powershell
cd 'C:\Users\SUBHAM\OneDrive\Desktop\MGPS'
Scripts\deploy-to-tomcat.ps1 -ProjectDir 'C:\Users\SUBHAM\OneDrive\Desktop\MGPS' -MavenCmd 'mvn' -WithOjdbc 'true' -TomcatWebapps 'C:\\Program Files\\Apache Software Foundation\\Tomcat 9.0\\webapps' -TomcatServiceName 'Tomcat9' -RestartService
```

- Edit the parameters to match your Tomcat installation and service name.

