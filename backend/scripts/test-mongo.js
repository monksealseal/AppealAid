const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('MongoDB Connected successfully!');
    console.log(`Connected to database: ${conn.connection.name}`);
    console.log(`MongoDB host: ${conn.connection.host}`);
    
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Connect to database and then close connection
const testConnection = async () => {
  const conn = await connectDB();
  console.log('Connection test successful. Closing connection...');
  await mongoose.disconnect();
  console.log('MongoDB connection closed.');
};

testConnection();