# Development Setup & Troubleshooting Guide

## Quick Fix Commands

### 1. Clear All Caches
```powershell
# Run the cache clearing script
npm run dev:clean
```

### 2. Start Development Server with Clean Cache
```powershell
npm run dev:start
```

### 3. Hard Refresh (Complete Reset)
```powershell
npm run hard-refresh
```

## Manual Cache Clearing Steps

### Next.js Cache
```powershell
# Remove Next.js build cache
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
```

### TypeScript Cache
```powershell
# Remove TypeScript build info
Remove-Item tsconfig.tsbuildinfo -ErrorAction SilentlyContinue
```

### Node Modules (Nuclear Option)
```powershell
# Remove and reinstall dependencies
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

## Browser Cache Clearing

### Chrome/Edge
1. Open Developer Tools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"
4. Or use `Ctrl+Shift+R`

### Firefox
1. Open Developer Tools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"
4. Or use `Ctrl+Shift+R`

## Common Issues & Solutions

### Issue: Changes not appearing
**Solution:**
1. Run `npm run dev:clean`
2. Restart development server
3. Hard refresh browser (Ctrl+Shift+R)

### Issue: Stale TypeScript errors
**Solution:**
1. Delete `tsconfig.tsbuildinfo`
2. Restart development server

### Issue: Stale CSS/Tailwind changes
**Solution:**
1. Clear browser cache
2. Restart development server
3. Hard refresh browser

### Issue: Hot reload not working
**Solution:**
1. Check if development server is running on correct port
2. Ensure no other processes are using port 3000
3. Restart development server

## Development Best Practices

1. **Always use the development server**: `npm run dev`
2. **Clear cache regularly**: `npm run dev:clean`
3. **Use hard refresh**: Ctrl+Shift+R when changes don't appear
4. **Check browser console**: Look for errors that might prevent updates
5. **Monitor terminal**: Watch for compilation errors

## Environment Variables for Development

Create a `.env.local` file in the frontend directory:
```
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1
NEXT_DISABLE_CACHE=true
NEXT_FORCE_RELOAD=true
``` 