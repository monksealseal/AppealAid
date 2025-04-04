#!/bin/bash
# Install dependencies for AppealAid

echo "Installing backend dependencies..."
cd /home/esima/cc1/AppealAid/backend
npm install express mongoose mongodb bcryptjs jsonwebtoken cookie-parser cors dotenv morgan winston helmet express-validator multer express-rate-limit

echo "Installing frontend dependencies..."
cd /home/esima/cc1/AppealAid/frontend
npm install axios react-router-dom @mui/material @mui/icons-material @emotion/react @emotion/styled formik yup

echo "Dependencies installation complete!"