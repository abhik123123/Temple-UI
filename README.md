# Temple React App - Multi-Environment Setup

A beautiful temple website built with React supporting multiple environments with different authentication requirements.

## Environments

### 1. **Local** (No Authentication)
- **Authentication Required:** ❌ NO
- **Direct Access:** Users can access all pages without login
- **Use Case:** Local development and testing

```bash
# Run Local (Default)
npm start

# Or explicitly
REACT_APP_ENV=local npm start
```

**Access:** http://localhost:3000

---

### 2. **DEV** (With Authentication)
- **Authentication Required:** ✅ YES
- **Login Required:** Users must authenticate before accessing pages
- **API:** https://dev-api.temple.com
- **Use Case:** Development environment with auth testing

```bash
# Run DEV environment
npm run start:dev
```

**Test Credentials:**
- Email: `test@temple.com`
- Password: `test123`

---

### 3. **UAT** (With Authentication)
- **Authentication Required:** ✅ YES
- **Login Required:** Users must authenticate before accessing pages
- **API:** https://uat-api.temple.com
- **Use Case:** User acceptance testing with production-like auth

```bash
# Run UAT environment
npm run start:uat
```

**Test Credentials:**
- Email: `test@temple.com`
- Password: `test123`

---

### 4. **Production** (With Authentication)
- **Authentication Required:** ✅ YES
- **API:** https://api.temple.com

```bash
# Build for Production
npm run build
```

---

## Features

### Pages
- ✅ **Home** - Welcome with feature highlights
- ✅ **Events** - Upcoming temple events
- ✅ **Services** - Spiritual services catalog
- ✅ **Priests** - Meet our spiritual leaders
- ✅ **Timings** - Weekly schedule and special occasions

### Authentication
- 🔐 Context-based auth management
- 🛡️ Protected routes for authenticated environments
- 👤 User profile display in navigation
- 🚪 Logout functionality
- 📍 Environment indicator

### Styling
- 🎨 Temple-themed design (brown/tan colors)
- 📱 Fully responsive layout
- ✨ Smooth animations and transitions
- 🔆 Professional UI components

---

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Environment (Default - No Auth)
```bash
npm start
```

Access: http://localhost:3000
- No login required
- Direct access to all pages

### 3. Run DEV Environment (With Auth)
```bash
npm run start:dev
```

Access: http://localhost:3000
- Login required at startup
- Test credentials provided

### 4. Run UAT Environment (With Auth)
```bash
npm run start:uat
```

Access: http://localhost:3000
- Login required at startup
- Test credentials provided

### 5. Build for Production
```bash
npm run build
```

---

## Environment Variables

### .env.local (No Auth)
```
REACT_APP_ENV=local
REACT_APP_API_URL=http://localhost:3001
```

### .env.dev (With Auth)
```
REACT_APP_ENV=dev
REACT_APP_API_URL=https://dev-api.temple.com
```

### .env.uat (With Auth)
```
REACT_APP_ENV=uat
REACT_APP_API_URL=https://uat-api.temple.com
```

### .env.production (With Auth)
```
REACT_APP_ENV=production
REACT_APP_API_URL=https://api.temple.com
```

---

## Authentication Flow

### Local Environment
```
User visits app → No auth check → Direct access to home page
```

### DEV/UAT/Production Environments
```
User visits app → Redirect to /login → Enter credentials → 
Verify with API → Store token → Access protected pages
```

---

## File Structure

```
src/
├── components/
│   ├── Navigation.jsx      (Navigation with user info)
│   ├── Footer.jsx
│   ├── ProtectedRoute.jsx  (Route protection)
├── context/
│   └── AuthContext.jsx     (Auth state & logic)
├── config/
│   └── environment.js      (Environment config)
├── pages/
│   ├── Login.jsx          (Login page)
│   ├── Home.jsx
│   ├── Events.jsx
│   ├── Services.jsx
│   ├── Priests.jsx
│   └── Timings.jsx
├── styles/
│   └── App.css            (Global styles)
├── App.jsx                (Main app with routing)
└── index.js               (Entry point)
```

---

## Customization

### Change Authentication for Environment
Edit `src/config/environment.js`:

```javascript
const config = {
  local: {
    requireAuth: false  // Set to true to enable auth
  },
  dev: {
    requireAuth: true   // Set to false to disable auth
  }
};
```

### Update API Endpoints
Update the `apiUrl` in `src/config/environment.js`:

```javascript
const config = {
  dev: {
    apiUrl: 'https://your-api-url.com'
  }
};
```

---

## Development Tips

1. **Check Current Environment:**
   - Look at the top-right corner of the navbar (shows "Env: NO-AUTH" or "Env: AUTH")

2. **Switch Environments While Running:**
   - Stop the server (Ctrl+C)
   - Run `npm run start:dev` or `npm run start:uat`
   - App will recompile with new environment

3. **View User Information:**
   - Once logged in, user name/email appears in navigation bar

4. **Debug Authentication:**
   - Open browser console to see auth-related logs
   - Check localStorage for stored tokens

---

## API Integration

To connect real authentication endpoints, update `src/context/AuthContext.jsx`:

```javascript
const response = await fetch(`${config.apiUrl}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
```

---

## Support

For issues or questions, please refer to the configuration files in `src/config/` and `src/context/`.

Enjoy your temple website! 🏛️
