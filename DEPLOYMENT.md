# AppealAid Deployment Guide

This guide explains how to deploy AppealAid to make it available online with user registration capability.

## Prerequisites

- MongoDB Atlas account (or another MongoDB hosting service)
- Heroku account (or another Node.js hosting service like Render, DigitalOcean, AWS, etc.)
- Netlify, Vercel, or GitHub Pages account for frontend hosting
- Git repository for your code (GitHub, GitLab, etc.)

## Step 1: Prepare MongoDB Database

1. Create a MongoDB Atlas account if you don't have one: https://www.mongodb.com/cloud/atlas/register
2. Create a new cluster (the free tier is sufficient for starting)
3. Create a database user with read and write permissions
4. Whitelist all IP addresses (0.0.0.0/0) for simplicity, or restrict to your deployment service IPs
5. Get your MongoDB connection string

## Step 2: Prepare Backend for Deployment

1. Update the backend `.env` file with your MongoDB Atlas connection string:

```
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/appealaid?retryWrites=true&w=majority
JWT_SECRET=your_long_random_secret_key
USE_MOCK_DB=false
MOCK_MONGO=false
CORS_ORIGIN=https://your-frontend-domain.com
```

2. Create a `Procfile` for Heroku deployment in the backend directory:

```
web: node server.js
```

3. Make sure your package.json has the right engines specification:

```json
"engines": {
  "node": ">=14.0.0"
}
```

## Step 3: Prepare Frontend for Deployment

1. Update the frontend `.env` file for production:

```
REACT_APP_API_URL=https://your-backend-api-domain.com/api
REACT_APP_USE_MOCK_API=false
```

2. Build the React app for production:

```bash
cd frontend
npm run build
```

This will create an optimized build in the `build` folder.

## Step 4: Deploy Backend to Heroku

1. Log in to Heroku CLI:

```bash
heroku login
```

2. Create a new Heroku app for backend:

```bash
cd backend
heroku create appealaid-api
```

3. Add environment variables to Heroku:

```bash
heroku config:set NODE_ENV=production
heroku config:set MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/appealaid?retryWrites=true&w=majority
heroku config:set JWT_SECRET=your_long_random_secret_key
heroku config:set USE_MOCK_DB=false
heroku config:set MOCK_MONGO=false
heroku config:set CORS_ORIGIN=https://your-frontend-domain.com
```

4. Deploy to Heroku:

```bash
git subtree push --prefix backend heroku main
```

Or if you're deploying from a subdirectory:

```bash
git push heroku `git subtree split --prefix backend main`:main --force
```

## Step 5: Deploy Frontend to Netlify/Vercel

### For Netlify:

1. Create a new site from Git in Netlify dashboard
2. Connect to your repository
3. Set the build command to `npm run build`
4. Set the publish directory to `build`
5. Add environment variables in Netlify dashboard:

```
REACT_APP_API_URL=https://your-heroku-app-name.herokuapp.com/api
REACT_APP_USE_MOCK_API=false
```

### For Vercel:

1. Import your repository in Vercel dashboard
2. Set the framework preset to Create React App
3. Add environment variables in Vercel dashboard (same as Netlify)
4. Deploy

## Step 6: Update CORS Settings

Make sure the backend CORS settings match your frontend domain:

In `server.js`, verify the CORS settings:

```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://your-frontend-domain.com',
  credentials: true
}));
```

## Step 7: Test the Deployment

1. Navigate to your frontend domain
2. Test user registration and login
3. Test all other functionalities 

## Notes for Security

1. Always use HTTPS for production
2. Generate a strong JWT secret and keep it private
3. Implement rate limiting for registration and login endpoints
4. Set up monitoring and notifications
5. Regularly backup your MongoDB database
6. Consider implementing email verification for registration

## Scaling Considerations

As your user base grows, consider:

1. Caching strategies (Redis)
2. Database scaling (MongoDB Atlas tiers)
3. Horizontal scaling for your API (multiple instances)
4. CDN for frontend assets
5. Optimization for mobile users

## Troubleshooting Common Issues

1. CORS errors: Verify the CORS_ORIGIN environment variable matches exactly your frontend domain
2. MongoDB connection issues: Check network access settings in MongoDB Atlas
3. Authentication problems: Verify JWT_SECRET is set correctly
4. Performance issues: Monitor server resources and database query performance