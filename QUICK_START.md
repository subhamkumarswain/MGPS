# MGPS Backend Migration - Node.js Setup Quick Start

## What Changed

Your MGPS application has been successfully migrated from **Java servlets** to **Node.js/Express**.

### Key Improvements:
✅ Modern Node.js stack with Express.js  
✅ Simplified authentication flow  
✅ Same database schema (Oracle)  
✅ Updated frontend with API integration  
✅ Better error handling and session management  

---

## Quick Start (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

This will install:
- `express` - Web framework
- `oracledb` - Oracle database driver
- `bcryptjs` - Password hashing
- `express-session` - Session management
- And more...

### 2. Configure Database Connection
Edit `.env` file:
```env
ORACLE_USER=mgps_app
ORACLE_PASSWORD=mgps_password
ORACLE_CONNECTIONSTRING=localhost:1521/XE
PORT=3000
SESSION_SECRET=your_secret_key_here
```

### 3. Run the Server
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

### 4. Access the Application
Open your browser and go to:
```
http://localhost:3000
```

---

## Project Structure

```
MGPS/
├── server.js                 # Main Express app
├── package.json              # Dependencies
├── .env                      # Configuration (create this)
├── config/
│   └── database.js           # Oracle connection pool
├── dao/
│   └── userDao.js            # Database operations
├── service/
│   └── userService.js        # Business logic
├── routes/
│   └── auth.js               # API endpoints (/api/auth/*)
├── utils/
│   └── passwordUtil.js       # Password hashing
└── src/main/webapp/
    ├── index.html            # Home page
    ├── login.html            # Login page
    ├── register.html         # Registration page
    ├── home.html             # Dashboard (after login)
    ├── js/
    │   └── api.js            # Frontend API client
    └── css/
        └── style.css         # Bootstrap styling
```

---

## API Endpoints

All API endpoints are prefixed with `/api/auth`:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/auth/login` | User login |
| POST | `/auth/register` | New user registration |
| GET | `/auth/verify` | Check authentication status |

### Example: Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"emp123","password":"pass123"}'
```

---

## Frontend Changes

The HTML files now use a modern JavaScript API client (`ApiService`) instead of form submissions:

**Old way (Java):**
```html
<form action="/login" method="post">
```

**New way (Node.js):**
```javascript
ApiService.login(username, password)
```

---

## Common Tasks

### Restart the Server
```bash
# Stop with Ctrl+C, then:
npm start
```

### View Logs
The server prints all database queries and errors to the console.

### Change Port
Edit `.env`:
```env
PORT=8000
```

### Update Database Connection
Edit `.env`:
```env
ORACLE_CONNECTIONSTRING=your-server:1521/YOUR_DB
```

---

## What Still Works?

✅ User registration and login  
✅ Role-based access (EMP, E1, EL, CISF)  
✅ Password hashing and verification  
✅ Session management  
✅ Database operations  
✅ Same database schema  

---

## Troubleshooting

### "Cannot find module 'express'"
```bash
npm install
```

### "Connection refused to database"
- Ensure Oracle is running
- Check connection string in `.env`
- Verify username/password

### "Port 3000 already in use"
```bash
# Change PORT in .env or kill the process:
lsof -i :3000
kill -9 <PID>
```

### "Session not working"
- Check `SESSION_SECRET` is set in `.env`
- Ensure cookies are enabled in browser

---

## Next Steps

1. ✅ Install dependencies (`npm install`)
2. ✅ Configure `.env` file
3. ✅ Run the server (`npm start`)
4. ✅ Test login at `http://localhost:3000/login.html`
5. 🚀 Deploy to production

---

## Documentation

- **Full guide:** See `README-NODEJS.md`
- **Database schema:** See `db/mgps_schema.sql`
- **API details:** See `routes/auth.js`

---

**Happy coding! 🎉**
