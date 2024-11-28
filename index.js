import express from 'express';
import mongoose from 'mongoose';
import authRoute from './routes/auth.js';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();  // Load environment variables from .env file

// Using environment variables from .env file
const PORT = process.env.PORT || 5555;
const mongoDBURL = process.env.MONGODB_URI;

const app = express();

// Middleware
app.use(express.json());

// CORS Setup
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5500', // Local development frontend
  'https://swissmote-frontend.onrender.com', // Deployed frontend
];

app.use(cors({
  origin: function (origin, callback) {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

// Route for User Authentication
app.use('/api/auth', authRoute);

// MongoDB Connection
mongoose.connect(mongoDBURL)
  .then(() => {
    console.log('App connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`App is listening to port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
  });
