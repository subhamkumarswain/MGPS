# MGPS Full Project Setup Guide

## Prerequisites: Install Node.js

### Option 1: Install Node.js from Official Website (Recommended)
1. Go to: https://nodejs.org/
2. Download **LTS (Long Term Support)** version
3. Run the installer and follow the steps
4. Select options:
   - ✅ "Add to PATH" (important!)
   - ✅ Install npm package manager
5. Restart your computer

### Option 2: Windows Chocolatey (if you have it)
```bash
choco install nodejs
```

### Verify Installation
After restarting, open PowerShell and run:
```bash
node --version
npm --version
```

You should see version numbers like:
```
v18.17.0 (or higher)
9.6.7 (or higher)
```

---

## Project Setup Steps

Once Node.js is installed, follow these steps:

### Step 1: Navigate to Project Directory
```bash
cd "c:\Users\SUBHAM\OneDrive\Desktop\MGPS"
```

### Step 2: Install Dependencies
```bash
npm install
```

This will create a `node_modules` folder and install:
- express (web framework)
- oracledb (database driver)
- bcryptjs (password hashing)
- express-session (session management)
- cors, body-parser, dotenv, etc.

### Step 3: Configure Database Connection
Open the `.env` file and update:
```env
ORACLE_USER=mgps_app
ORACLE_PASSWORD=mgps_password
ORACLE_CONNECTIONSTRING=localhost:1521/XE
PORT=3000
NODE_ENV=development
SESSION_SECRET=your_secure_session_secret_here
```

⚠️ **Important:** Update these with your actual Oracle database credentials!

### Step 4: Setup Oracle Instant Client (Windows)
For the oracledb driver to work on Windows, you need Oracle Instant Client:

1. Download from: https://www.oracle.com/database/technologies/instant-client/downloads.html
2. Select "Instant Client for Windows (x64)" (19c or 21c)
3. Extract to a folder (e.g., `C:\oracle\instantclient`)
4. Add to system PATH:
   - Right-click "This PC" → Properties
   - Click "Advanced system settings"
   - Click "Environment Variables"
   - Under "System variables", click "New"
   - Variable name: `Path`
   - Add: `C:\oracle\instantclient`
   - Click OK

Or set it in `.env`:
```env
ORACLE_CLIENT_LIB_DIR=C:\oracle\instantclient
```

### Step 5: Start the Server
```bash
npm start
```

You should see:
```
Server is running on port 3000
Visit http://localhost:3000 to access the application
```

### Step 6: Test the Application
1. Open browser: `http://localhost:3000`
2. You should see the MGPS home page
3. Click "Register" to create a test account
4. Click "Login" with your credentials
5. You should see your profile on the home page

---

## Frontend Pages Overview

| URL | Purpose |
|-----|---------|
| `http://localhost:3000` | Index/Home page |
| `http://localhost:3000/login.html` | Login page |
| `http://localhost:3000/register.html` | Registration page |
| `http://localhost:3000/home.html` | Dashboard (after login) |

---

## Backend API Endpoints

The server provides these API endpoints:

### Authentication Endpoints (all under `/api/auth`)
- **POST** `/api/auth/login` - Login with username & password
- **POST** `/api/auth/register` - Register new user
- **GET** `/api/auth/verify` - Check if user is logged in

### Example API Calls
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"emp123\",\"password\":\"pass123\"}"

# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"empId\":\"emp456\",\"name\":\"John Doe\",\"designation\":\"Engineer\",\"deptCode\":\"ENG\",\"password\":\"pass123\",\"roles\":[\"EMP\"]}"

# Verify Session
curl http://localhost:3000/api/auth/verify
```

---

## Development vs Production

### Development (with auto-reload)
```bash
npm run dev
```
Uses `nodemon` to automatically restart when files change.

### Production
```bash
npm start
```
Standard Node.js server.

---

## Database Schema

The following tables are created in your Oracle database:

```sql
MGPS_USERS
├── EMP_ID (Primary Key)
├── NAME
├── DESIGNATION
├── PASSWORD_HASH
├── SALT
├── DEPT_CODE
└── CREATED_AT

MGPS_ROLES
├── ROLE_ID (Primary Key)
├── ROLE_NAME (EMP, E1, EL, CISF)

MGPS_USER_ROLES
├── EMP_ID (Foreign Key)
└── ROLE_ID (Foreign Key)
```

Run the DDL script to create tables:
```bash
sqlplus mgps_app/mgps_password@XE < db/mgps_schema.sql
```

---

## Project File Structure

```
MGPS/
├── server.js                          # Main Express server
├── package.json                       # Dependencies (npm packages)
├── .env                               # Configuration (create this!)
├── .gitignore                         # Git ignore rules
├── node_modules/                      # Installed packages (created by npm)
├── config/
│   └── database.js                    # Oracle connection pool
├── dao/
│   └── userDao.js                     # Database access layer
├── service/
│   └── userService.js                 # Business logic
├── routes/
│   └── auth.js                        # API routes (/api/auth/*)
├── utils/
│   └── passwordUtil.js                # Password hashing utilities
├── src/main/webapp/
│   ├── index.html                     # Home page
│   ├── login.html                     # Login page
│   ├── register.html                  # Registration page
│   ├── home.html                      # Dashboard (protected)
│   ├── js/
│   │   ├── api.js                     # Frontend API client
│   │   └── app.js                     # App logic
│   └── css/
│       └── style.css                  # Bootstrap styling
├── db/
│   └── mgps_schema.sql                # Database DDL
├── scripts/
│   ├── deploy-to-tomcat.ps1           # (deprecated)
│   └── run-ddl.ps1                    # (deprecated)
├── README-NODEJS.md                   # Full documentation
└── QUICK_START.md                     # Quick start guide
```

---

## Troubleshooting

### Error: "Cannot find module 'express'"
**Solution:**
```bash
npm install
```

### Error: "EADDRINUSE: address already in use :::3000"
**Solution:** Port 3000 is already in use
```bash
# Option 1: Kill the process
Get-Process -Name node | Stop-Process

# Option 2: Use different port
# Edit .env: PORT=8000
```

### Error: "ORA-12514: TNS:listener does not currently know of service"
**Solution:** Oracle database not running or wrong connection string
- Check if Oracle is running
- Verify `ORACLE_CONNECTIONSTRING` in `.env`

### Error: "Cannot locate module oracledb"
**Solution:** Oracle Instant Client not installed
- Download from Oracle website
- Add to system PATH
- Restart PowerShell
- Run `npm install` again

### Login/Register not working
**Solution:** Check browser console (F12)
- Look for error messages in Developer Tools
- Check server logs in PowerShell
- Verify database connection

---

## Next Steps After Setup

1. ✅ Install Node.js
2. ✅ Run `npm install`
3. ✅ Configure `.env`
4. ✅ Run `npm start`
5. 🌐 Test at `http://localhost:3000`
6. 👤 Create test account
7. ✅ Verify login works
8. 🚀 Ready for production!

---

## Production Deployment

When ready to deploy:

1. Set `NODE_ENV=production` in `.env`
2. Use a process manager: `pm2 start server.js`
3. Set up reverse proxy (Nginx)
4. Enable HTTPS/SSL
5. Configure firewall

See `README-NODEJS.md` for production setup details.

---

## Support Files

- **QUICK_START.md** - 5-minute quick start
- **README-NODEJS.md** - Complete documentation
- **package.json** - All npm dependencies listed
- **routes/auth.js** - API endpoint documentation

---

**Everything is ready! Just install Node.js and follow the steps above.** ✅
