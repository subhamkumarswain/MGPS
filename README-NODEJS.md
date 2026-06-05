# MGPS Backend - Node.js Migration Guide

## Overview
This is the Node.js/Express backend for the MGPS (Management and GPS System) application. The backend has been migrated from Java servlets to a modern Node.js stack.

## Prerequisites
- Node.js 14.x or higher
- npm or yarn
- Oracle Database (configured and running)
- Oracle Instant Client (for oracledb driver)

## Installation

### 1. Install Node.js Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and update the values for your environment.

```bash
cp .env.example .env
```

Create a `.env` file in the root directory with the following variables:

```env
# Oracle SYS credentials for database setup
SYS_USER=sys
SYS_PASSWORD=your_sys_password
SYS_CONNECTIONSTRING=localhost:1521/XEPDB1

# Application database credentials
ORACLE_USER=mgps_app
ORACLE_PASSWORD=mgps_password
ORACLE_CONNECTIONSTRING=localhost:1521/XEPDB1

# Server Configuration
PORT=3000
NODE_ENV=development

# Session Configuration
SESSION_SECRET=your_secure_session_secret_key_here
```

For Oracle XE, the default pluggable database service is typically `XEPDB1`.

### 3. Oracle Database Setup
If you haven't already set up the database, run the DDL script or use the setup script:

```bash
sqlplus mgps_app/mgps_password@XE < db/mgps_schema.sql
```

## Project Structure

```
├── config/
│   └── database.js          # Oracle database connection pool
├── dao/
│   └── userDao.js           # Data Access Object for user operations
├── service/
│   └── userService.js       # Business logic for user management
├── routes/
│   └── auth.js              # Authentication routes
├── utils/
│   └── passwordUtil.js      # Password hashing and verification
├── src/main/webapp/
│   ├── index.html           # Home page
│   ├── login.html           # Login page
│   ├── register.html        # Registration page
│   ├── home.html            # Authenticated home page
│   ├── js/
│   │   └── api.js           # Frontend API client
│   └── css/
│       └── style.css        # Stylesheet
├── server.js                # Main Express application
├── package.json             # Dependencies and scripts
├── .env                     # Environment variables (create this)
└── .gitignore               # Git ignore rules
```

## Running the Application

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000` by default.

## API Endpoints

### Authentication Routes
All authentication endpoints are under `/api/auth`:

#### POST `/api/auth/login`
Login with username and password
```json
Request:
{
  "username": "emp123",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "user": {
    "empId": "emp123",
    "name": "John Doe",
    "designation": "Engineer",
    "deptCode": "ENG",
    "roles": ["EMP", "E1"]
  }
}
```

#### POST `/api/auth/register`
Register a new user
```json
Request:
{
  "empId": "emp456",
  "name": "Jane Smith",
  "designation": "Manager",
  "deptCode": "MGR",
  "password": "securepass123",
  "roles": ["EMP", "EL"]
}

Response:
{
  "success": true,
  "message": "User registered successfully"
}
```

#### GET `/api/auth/verify`
Verify if user is authenticated
```json
Response (Authenticated):
{
  "authenticated": true,
  "user": { ... }
}

Response (Not Authenticated):
{
  "authenticated": false,
  "error": "Not authenticated"
}
```

### Other Endpoints

#### GET `/api/health`
Check server health status
```json
Response:
{
  "status": "Server is running"
}
```

#### GET `/api/session`
Get current session information (requires authentication)
```json
Response:
{
  "user": { ... }
}
```

#### GET `/api/logout`
Logout current user
```json
Response:
{
  "message": "Logged out successfully"
}
```

## Frontend Integration

The frontend files (HTML, CSS, JS) are automatically served from `src/main/webapp` directory.

### API Client
Use the `ApiService` class (in `src/main/webapp/js/api.js`) for all API calls:

```javascript
// Login
await ApiService.login(username, password);

// Register
await ApiService.register(empId, name, designation, deptCode, password, roles);

// Verify authentication
await ApiService.verify();

// Get session info
await ApiService.getSession();

// Logout
await ApiService.logout();

// Health check
await ApiService.health();
```

## Database Schema

The application uses the following Oracle database tables:

### MGPS_USERS
- EMP_ID (PRIMARY KEY)
- NAME
- DESIGNATION
- PASSWORD_HASH
- SALT
- DEPT_CODE
- CREATED_AT

### MGPS_ROLES
- ROLE_ID (PRIMARY KEY)
- ROLE_NAME (UNIQUE)

### MGPS_USER_ROLES
- EMP_ID (FOREIGN KEY)
- ROLE_ID (FOREIGN KEY)
- PRIMARY KEY (EMP_ID, ROLE_ID)

## Security Features

1. **Password Hashing**: Uses bcryptjs for secure password hashing
2. **Salt Generation**: Random salt per user for additional security
3. **Session Management**: Express sessions with secure cookies
4. **CORS**: Configured for security
5. **Input Validation**: Validation on all API endpoints

## Troubleshooting

### Oracle Connection Issues
- Ensure Oracle Database is running
- Verify connection string in `.env` file
- Check Oracle Instant Client is installed and configured

### Port Already in Use
Change the PORT in `.env` file or run:
```bash
lsof -i :3000  # Find process using port 3000
kill -9 <PID>  # Kill the process
```

### CORS Issues
The CORS middleware is configured to allow requests. Adjust in `server.js` if needed.

## Migration from Java

### Key Changes
1. **Servlets → Express Routes**: Java servlets now replaced with Express route handlers
2. **JSP → HTML**: Dynamic JSP pages now use static HTML with JavaScript
3. **Hibernate/JDBC → Oracle Driver**: Direct database connections using oracledb
4. **Java DAO → Node.js DAO**: Same pattern implemented in JavaScript
5. **Password Hashing**: Java's PBKDF2 replaced with bcryptjs (more efficient)

### Preserved Functionality
- User registration and authentication
- Role-based access control
- Database schema remains the same
- Session management
- Same business logic

## Next Steps

1. Test the application locally
2. Configure production environment variables
3. Set up SSL/HTTPS for production
4. Deploy to your hosting environment
5. Configure reverse proxy (nginx/Apache) if needed

## Support

For issues or questions, refer to the original Java backend documentation or check the Node.js/Express documentation at:
- Express: https://expressjs.com
- oracledb: https://oracle.github.io/node-oracledb/
- bcryptjs: https://github.com/dcodeIO/bcrypt.js
