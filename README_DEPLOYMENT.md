# GitHub Pages Deployment Guide

## Issues Fixed

1. **MIME Type Error**: Fixed by ensuring proper file extensions and module type attributes
2. **404 for vite.svg**: Removed reference, using favicon instead
3. **Base Path**: Configurable via `VITE_BASE_PATH` environment variable

## Deployment Steps

### Option 1: Manual Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Set the base path if deploying to a subdirectory:
   ```bash
   # For repository subdirectory (e.g., username.github.io/repo-name)
   export VITE_BASE_PATH=/repo-name/
   npm run build
   
   # For root domain
   export VITE_BASE_PATH=/
   npm run build
   ```

3. Deploy the `dist` folder to GitHub Pages:
   - Go to repository Settings > Pages
   - Select source: Deploy from a branch
   - Branch: `gh-pages` (or your chosen branch)
   - Folder: `/ (root)` or `/dist` depending on your setup

### Option 2: GitHub Actions (Recommended)

The `.github/workflows/deploy.yml` file is configured to automatically:
- Build on push to main branch
- Deploy to GitHub Pages
- Handle base path automatically

Just push to main and it will deploy automatically.

## Configuration

### Base Path

If your site is at `https://username.github.io/repo-name/`, set:
```bash
VITE_BASE_PATH=/repo-name/
```

If your site is at `https://yourdomain.com/`, set:
```bash
VITE_BASE_PATH=/
```

### API URL

Set your production API URL:
```bash
VITE_API_URL=https://your-api-url.com/api
```

## Troubleshooting

### Blank Page

1. Check browser console for errors
2. Verify base path is correct
3. Ensure `.nojekyll` file exists in dist folder
4. Check that all assets are loading correctly

### MIME Type Errors

- Ensure `.nojekyll` file exists (prevents Jekyll processing)
- Verify file extensions are correct (.js, .css, etc.)
- Check that GitHub Pages is serving from the correct branch/folder

### 404 Errors

- Verify base path matches your GitHub Pages URL structure
- Check that `404.html` exists for SPA routing
- Ensure all asset paths are relative

