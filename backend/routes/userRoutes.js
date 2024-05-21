// backend/routes/userRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = new User({ username, password });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, 'secretkey', { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in' });
  }
});

router.post('/add-password', async (req, res) => {
  const { token, site, username, password } = req.body;
  try {
    const decoded = jwt.verify(token, 'secretkey');
    const user = await User.findById(decoded.id);
    user.passwords.push({ site, username, password });
    await user.save();
    res.json({ message: 'Password added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding password' });
  }
});

router.get('/get-passwords', async (req, res) => {
  const { token } = req.query;
  try {
    const decoded = jwt.verify(token, 'secretkey');
    const user = await User.findById(decoded.id);
    res.json(user.passwords);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching passwords' });
  }
});

module.exports = router;
