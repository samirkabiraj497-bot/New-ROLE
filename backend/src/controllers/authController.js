const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/auth');

// Since we don't have a real DB connection yet, we will mock the users array.
// In a real scenario, we'd use Supabase client here.
const users = [];

exports.register = async (req, res, next) => {
  try {
    const { full_name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const userExists = users.find(u => u.email === email);
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const newUser = {
      id: Date.now().toString(),
      full_name,
      email,
      password_hash
    };

    users.push(newUser);

    const token = generateToken(newUser.id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.id,
        full_name: newUser.full_name,
        email: newUser.email
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
};
