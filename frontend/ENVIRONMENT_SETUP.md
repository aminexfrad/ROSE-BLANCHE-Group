# Environment Setup Guide

## Required Environment Variables

To fix the environment validation error, you need to create a `.env.local` file in the frontend directory with the following variables:

### Create `.env.local` file

Create a file named `.env.local` in the `frontend/` directory with the following content:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# App Configuration
NEXT_PUBLIC_APP_NAME=StageBloom
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_VERSION=1.0.0

# Development Settings
NODE_ENV=development
```

### Steps to create the file:

1. Navigate to the `frontend/` directory
2. Create a new file named `.env.local`
3. Copy the content above into the file
4. Save the file
5. Restart your Next.js development server

### Alternative: Using Command Line

You can also create the file using the command line:

**Windows (PowerShell):**
```powershell
cd frontend
New-Item -Path ".env.local" -ItemType File
Add-Content -Path ".env.local" -Value "# API Configuration"
Add-Content -Path ".env.local" -Value "NEXT_PUBLIC_API_URL=http://localhost:8000/api"
Add-Content -Path ".env.local" -Value ""
Add-Content -Path ".env.local" -Value "# App Configuration"
Add-Content -Path ".env.local" -Value "NEXT_PUBLIC_APP_NAME=StageBloom"
Add-Content -Path ".env.local" -Value "NEXT_PUBLIC_APP_URL=http://localhost:3000"
Add-Content -Path ".env.local" -Value "NEXT_PUBLIC_APP_VERSION=1.0.0"
Add-Content -Path ".env.local" -Value ""
Add-Content -Path ".env.local" -Value "# Development Settings"
Add-Content -Path ".env.local" -Value "NODE_ENV=development"
```

**Windows (Command Prompt):**
```cmd
cd frontend
echo # API Configuration > .env.local
echo NEXT_PUBLIC_API_URL=http://localhost:8000/api >> .env.local
echo. >> .env.local
echo # App Configuration >> .env.local
echo NEXT_PUBLIC_APP_NAME=StageBloom >> .env.local
echo NEXT_PUBLIC_APP_URL=http://localhost:3000 >> .env.local
echo NEXT_PUBLIC_APP_VERSION=1.0.0 >> .env.local
echo. >> .env.local
echo # Development Settings >> .env.local
echo NODE_ENV=development >> .env.local
```

### After creating the file:

1. Stop your Next.js development server (Ctrl+C)
2. Restart it with: `npm run dev` or `yarn dev`
3. The environment validation error should be resolved

### Additional Notes:

- The `.env.local` file is automatically ignored by Git (it's in `.gitignore`)
- Make sure your backend Django server is running on `http://localhost:8000` for the API to work
- If you're using a different backend URL, update `NEXT_PUBLIC_API_URL` accordingly

### Optional Environment Variables:

You can also add these optional variables to `.env.local` if needed:

```env
# Optional: Analytics and Monitoring
# NEXT_PUBLIC_GA_ID=your-google-analytics-id
# NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn

# Optional: External Services
# GOOGLE_SITE_VERIFICATION=your-google-site-verification

# Optional: NextAuth (if implementing authentication)
# NEXTAUTH_SECRET=your-nextauth-secret
# NEXTAUTH_URL=http://localhost:3000
``` 