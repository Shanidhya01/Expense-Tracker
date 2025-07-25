const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

// Register user
exports.registerUser = async (req, res) => {
  const { fullName, email, password, profileImageUrl } = req.body;

  if(!fullName || !email || !password) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      fullName,
      email,
      password,
      profileImageUrl
    });

    res.status(201).json({
      id: user._id,
      user,
      token: generateToken(user._id)
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
}

// Login user
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try{
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    res.status(200).json({
      id: user._id,
      user,
      token: generateToken(user._id)
    });
  } catch(error){
    res
      .status(500)
      .json({ message: "Error logging in user", error: error.message });
  }
}

// Get user information
exports.getUserInfo = async (req, res) => {
  try{
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  }catch(error){
    res
      .status(500)
      .json({ message: "Error fetching user information", error: error.message });
  }
}