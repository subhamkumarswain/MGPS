# 🚀 GET STARTED IN 3 MINUTES

## Step 1: Install Node.js (if not already installed)

Visit: https://nodejs.org/
- Download **LTS** (Long Term Support) version
- Run installer
- Follow setup wizard
- **Restart your computer**

Verify it worked:
```bash
node --version  # Should show v18.x.x or higher
npm --version   # Should show 9.x.x or higher
```

---

## Step 2: Install Project Dependencies

Open PowerShell or Command Prompt and run:

```bash
cd "c:\Users\SUBHAM\OneDrive\Desktop\MGPS"
npm install
```

This will create `node_modules` folder with all required packages.

---

## Step 3: Start the Server

```bash
npm start
```

You should see:
```
Server is running on port 3000
Visit http://localhost:3000 to access the application
```

---

## Step 4: Open in Browser

Visit: **http://localhost:3000**

You should see the MGPS home page!

---

## Test the System

1. Click **"Register"**
2. Fill in form:
   - EMP ID: `test001`
   - Name: `Test User`
   - Password: `test123`
   - Role: Check `EMP`
3. Click **"Register"** button
4. Click **"Login"** link
5. Login with credentials
6. ✅ You should see your profile!

---

## 📋 Important Files

- **.env** - Edit with your database details
- **start-server.bat** - Windows startup (double-click)
- **README.md** - Full documentation
- **SETUP_GUIDE.md** - Detailed instructions

---

## ⚠️ Configuration

Before the app fully works, edit `.env`:

```env
ORACLE_USER=mgps_app
ORACLE_PASSWORD=mgps_password
ORACLE_CONNECTIONSTRING=localhost:1521/XE
```

Update with your actual Oracle database credentials.

---

## 🆘 Issues?

**Node.js not found?**
```bash
# Restart PowerShell after installing Node.js
```

**Port 3000 already in use?**
```bash
# Edit .env and change: PORT=8000
# Then run: npm start
```

**Database connection failed?**
```bash
# Verify Oracle is running
# Check credentials in .env file
```

See **SETUP_GUIDE.md** for more troubleshooting.

---

## 📚 Documentation

- **README.md** - Project overview
- **QUICK_START.md** - Quick reference
- **SETUP_GUIDE.md** - Complete setup guide
- **README-NODEJS.md** - API documentation
- **COMPLETED_SETUP.md** - What was done

---

**That's it! Your MGPS app is ready to run!** 🎉
