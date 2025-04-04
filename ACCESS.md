# Access AppealAid

AppealAid is now online and ready to use! Here's how to access and use the application:

## Accessing the Application

The application is currently running locally on your machine:

- **Frontend URL:** http://localhost:3001
- **Backend API URL:** http://localhost:5000

## Creating an Account

1. Navigate to http://localhost:3001 in your web browser
2. Click on "Create an Account" or navigate to http://localhost:3001/register
3. Fill out the registration form with your information:
   - Email address
   - Password (at least 8 characters)
   - Personal details
   - Insurance information
4. Click "Register" to create your account
5. You'll be automatically logged in and redirected to the dashboard

## Using AppealAid

### Creating an Appeal

1. From the dashboard, click on "Create New Appeal"
2. Upload your explanation of benefits or denial letter
3. Follow the guided process to create your appeal
4. Review and submit your appeal

### Managing Appeals

1. View all your appeals from the dashboard
2. Click on an appeal to see its details
3. Track status and deadlines
4. Manage documents and follow-ups

### Using Peer-to-Peer Reviews

1. Open an appeal and navigate to the "Peer-to-Peer" tab
2. Schedule a new review
3. Use the discussion points and preparation tips
4. Document the outcome of your review

## Stopping the Application

When you're done using AppealAid, you can stop the servers by running:

```bash
cd /home/esima/cc1/AppealAid
./stop-servers.sh
```

## Restarting the Application

To restart the application at any time:

```bash
cd /home/esima/cc1/AppealAid
./deploy-local.sh
```

## Getting Help

If you need help using AppealAid:

1. Check the documentation available in the /docs directory
2. Review the README.md for general information
3. Explore the application features through the UI

## Next Steps for Online Deployment

To deploy AppealAid online for public access, follow the instructions in DEPLOYMENT.md and NEXT_STEPS.md.

The current setup is using mock data mode for demonstration purposes. For a production deployment with real data persistence, you'll need to connect to a MongoDB database as described in the deployment documentation.