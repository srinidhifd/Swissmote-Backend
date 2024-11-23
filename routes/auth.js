import express from 'express';
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
const router = express.Router();

// Use environment variables for JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

// User Signup Route
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please enter all fields.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign({ user: { id: user._id } }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// User Login Route
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Compare password with hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Generate JWT token
    const token = jwt.sign({ user: { id: user._id } }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

export default router;
