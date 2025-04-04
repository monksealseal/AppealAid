# AppealAid - Insurance Appeal Automation Platform

AppealAid is a comprehensive platform designed to streamline the insurance appeal process for healthcare providers and patients. The application helps users create, track, and manage insurance appeals efficiently.

## Live Demo

The application is available for demo at: [https://monksealseal.github.io/AppealAid/](https://monksealseal.github.io/AppealAid/)

You can log in with any email and password to test the application. All data is mock data for demonstration purposes.

## Features

- **User Authentication & Authorization**: Secure account creation and login
- **Appeal Creation**: Guided process to create effective insurance appeals
- **Document Management**: Upload and manage supporting documentation
- **Peer-to-Peer Reviews**: Tools for physicians to prepare for peer-to-peer reviews
- **Appeal Tracking**: Monitor appeal status and deadlines
- **Provider Collaboration**: Collaborate with healthcare providers
- **Analytics Dashboard**: Track success rates and patterns

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- RESTful API

### Frontend
- React.js
- Material UI
- Redux (state management)
- Axios (API requests)
- Formik & Yup (form validation)

## Getting Started

### Prerequisites
- Node.js (v14.0.0 or later)
- npm or yarn
- MongoDB (local or Atlas)

### Installation

#### Clone the repository
```bash
git clone <repository-url>
cd AppealAid
```

#### Install dependencies
```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

#### Set up environment variables
```bash
# Backend
cp backend/.env.template backend/.env
# Edit .env with your MongoDB connection string and JWT secret

# Frontend
cp frontend/.env.template frontend/.env
# Edit .env with your API URL
```

#### Start development servers
```bash
# Backend
cd backend
npm run dev

# Frontend (in a new terminal)
cd frontend
npm start
```

The application should now be running at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Deployment

For production deployment, follow the instructions in [DEPLOYMENT.md](./DEPLOYMENT.md).

Quick deployment scripts are available:
```bash
# Prepare for deployment
./prepare-deploy.sh

# Follow instructions in DEPLOY_INSTRUCTIONS.md
```

## Project Structure

```
AppealAid/
├── backend/                # Backend API
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Express middleware
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── utils/              # Utility functions
│   └── server.js           # Server entry point
│
├── frontend/               # React frontend
│   ├── public/             # Static files
│   └── src/
│       ├── actions/        # Redux actions
│       ├── components/     # React components
│       ├── context/        # React context
│       ├── pages/          # Page components
│       ├── reducers/       # Redux reducers
│       ├── services/       # API services
│       └── utils/          # Utility functions
│
├── docs/                   # Documentation
└── scripts/                # Utility scripts
```

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/my-new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.