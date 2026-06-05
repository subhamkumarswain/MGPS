# 🎉 MGPS - Management and GPS System

Modern Node.js + Express.js backend with Bootstrap frontend and Oracle database

## ⚡ Quick Start (3 Steps)

### 1. Install Node.js
Download from: https://nodejs.org/ (LTS version)

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Server
```bash
npm start
```

Visit: **http://localhost:3000**

---

## 📦 Tech Stack

- **Backend:** Node.js + Express.js
- **Database:** Oracle XE
- **Frontend:** Bootstrap 5 + Vanilla JavaScript
- **Authentication:** Session-based + bcryptjs
- **API:** RESTful endpoints

---

## 🚀 Features

✅ User registration and login  
✅ Secure password hashing (bcryptjs)  
✅ Session management  
✅ Role-based access control (EMP, E1, EL, CISF)  
✅ Oracle database integration  
✅ RESTful API endpoints  
✅ Responsive Bootstrap UI  
✅ Error handling & validation  

---

## 📁 Project Structure

```
MGPS/
├── server.js                      # Express server
├── package.json                   # Dependencies
├── .env                           # Configuration
├── config/database.js             # Oracle connection
├── routes/auth.js                 # API endpoints
├── service/userService.js         # Business logic
├── dao/userDao.js                 # Database layer
├── utils/passwordUtil.js          # Password hashing
├── src/main/webapp/               # Frontend
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── home.html
│   ├── js/api.js
│   └── css/style.css
└── db/mgps_schema.sql             # Database DDL
```

---

## 🔧 Configuration

Copy the example file and update your environment values:

```bash
cp .env.example .env
```

Then edit `.env`:

```env
SYS_USER=sys
SYS_PASSWORD=your_sys_password
SYS_CONNECTIONSTRING=localhost:1521/XEPDB1
ORACLE_USER=mgps_app
ORACLE_PASSWORD=mgps_password
ORACLE_CONNECTIONSTRING=localhost:1521/XEPDB1
PORT=3000
NODE_ENV=development
SESSION_SECRET=your_secret_key_here
```

If you run `setup-database.js`, the `SYS_USER` and `SYS_PASSWORD` values are required for initial Oracle setup. For Oracle XE, the default pluggable database service is typically `XEPDB1`.

---

## 📚 API Endpoints

```
POST   /api/auth/login       - User login
POST   /api/auth/register    - New user registration
GET    /api/auth/verify      - Check authentication
GET    /api/logout           - User logout
```

---

## 🌐 Frontend Pages

- Home: http://localhost:3000
- Login: http://localhost:3000/login.html
- Register: http://localhost:3000/register.html
- Dashboard: http://localhost:3000/home.html

---

## 📋 Database Setup

Create Oracle user and tables:

```sql
CREATE USER mgps_app IDENTIFIED BY mgps_password;
GRANT CONNECT, RESOURCE TO mgps_app;
```

Then run: `db/mgps_schema.sql`

---

## 📚 Documentation

- **SETUP_GUIDE.md** - Detailed setup instructions
- **QUICK_START.md** - Quick reference
- **README-NODEJS.md** - Full API documentation
- **PROJECT_SETUP.md** - Complete checklist

---

## 🎯 Development Commands

```bash
npm start                 # Start production server
npm run dev              # Start dev server (auto-reload)
node --version          # Check Node.js version
npm --version           # Check npm version
npm install             # Install dependencies
npm list                # List installed packages
```

---

## 🐛 Troubleshooting

**Node.js not found?**
- Install from https://nodejs.org/
- Restart PowerShell

**Port already in use?**
- Change PORT in .env
- Or: `Get-Process -Name node | Stop-Process`

**Database connection failed?**
- Verify Oracle is running
- Check credentials in .env
- Install Oracle Instant Client

---

## ✨ Migration from Java

**What Changed:**
- Java servlets → Express.js routes
- JSP templates → HTML + JavaScript
- JDBC → OracleDB driver
- Java DAO → JavaScript DAO

**What Stayed the Same:**
- Oracle database schema
- User authentication logic
- Role-based access control
- Password hashing algorithm

---

## 🚀 Ready to Deploy?

1. Set `NODE_ENV=production` in .env
2. Use PM2: `npm install -g pm2 && pm2 start server.js`
3. Set up Nginx reverse proxy
4. Enable HTTPS/SSL

See **README-NODEJS.md** for production setup.

---

**Status:** ✅ Ready for Development & Production  
**Last Updated:** 2024  
**Maintained By:** MGPS Development Team

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

