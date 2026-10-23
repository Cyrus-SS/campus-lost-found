const bcrypt = require('bcryptjs');
const User = require('../models/User');

const SALT_ROUNDS = 10;

const register = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ username, password: hash, role });
    res.status(201).json({ id: user._id, username: user.username, role: user.role });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    const valid = user && await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.json({ message: 'Login OK', role: user.role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login };