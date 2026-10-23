const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticator } = require('otplib');
const QRCode = require('qrcode');
const User = require('../models/User');

const SALT_ROUNDS = 10;

const issueToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

const register = async (req, res) => {
  try {
    const { username, password } = req.body;
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ username, password: hash });
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
    if (user.mfaEnabled) {
      const mfaToken = jwt.sign(
        { id: user._id, purpose: 'mfa' },
        process.env.JWT_SECRET,
        { expiresIn: '5m' }
      );
      return res.json({ mfaRequired: true, mfaToken });
    }
    res.json({ token: issueToken(user), role: user.role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginMfa = async (req, res) => {
  try {
    const { mfaToken, code } = req.body;
    const decoded = jwt.verify(mfaToken, process.env.JWT_SECRET);
    if (decoded.purpose !== 'mfa') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    const user = await User.findById(decoded.id);
    if (!user || !user.mfaSecret || !authenticator.check(String(code), user.mfaSecret)) {
      return res.status(401).json({ message: 'Invalid code' });
    }
    res.json({ token: issueToken(user), role: user.role });
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired session. Log in again.' });
  }
};

const setupMfa = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.mfaEnabled) {
      return res.status(400).json({ message: 'MFA is already enabled' });
    }
    const secret = authenticator.generateSecret();
    user.mfaSecret = secret;
    await user.save();
    const otpauth = authenticator.keyuri(user.username, 'Campus Lost & Found', secret);
    const qr = await QRCode.toDataURL(otpauth);
    res.json({ qr });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const confirmMfa = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.mfaSecret || !authenticator.check(String(req.body.code), user.mfaSecret)) {
      return res.status(400).json({ message: 'Invalid code' });
    }
    user.mfaEnabled = true;
    await user.save();
    res.json({ message: 'MFA enabled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, loginMfa, setupMfa, confirmMfa };