const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, role, phone, dateOfBirth, insuranceInfo } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });
  
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    role: role || 'patient',
    phone,
    dateOfBirth,
    insuranceInfo
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      insuranceInfo: user.insuranceInfo,
      token: generateToken(user._id)
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email });

  // Check if user exists & password matches
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      insuranceInfo: user.insuranceInfo,
      token: generateToken(user._id)
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  // Find user by ID
  const user = await User.findById(req.user.id);

  if (user) {
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      insuranceInfo: user.insuranceInfo,
      consents: user.consents
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  // Find user by ID
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Update user data
  user.firstName = req.body.firstName || user.firstName;
  user.lastName = req.body.lastName || user.lastName;
  user.email = req.body.email || user.email;
  
  // Only update password if provided
  if (req.body.password) {
    user.password = req.body.password;
  }
  
  // Update insurance info if provided
  if (req.body.insuranceInfo) {
    user.insuranceInfo = {
      ...user.insuranceInfo,
      ...req.body.insuranceInfo
    };
  }

  // Save the updated user
  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    firstName: updatedUser.firstName,
    lastName: updatedUser.lastName,
    email: updatedUser.email,
    role: updatedUser.role,
    insuranceInfo: updatedUser.insuranceInfo,
    message: 'Profile updated successfully'
  });
});

// @desc    Get consent status
// @route   GET /api/users/consent
// @access  Private
const getConsentStatus = asyncHandler(async (req, res) => {
  // Find user by ID
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json(user.consents);
});

// @desc    Update consent status
// @route   PUT /api/users/consent
// @access  Private
const updateConsentStatus = asyncHandler(async (req, res) => {
  const { termsAndConditions, privacyPolicy, dataProcessing } = req.body;

  // Find user by ID
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Update consents
  user.consents = {
    termsAndConditions: termsAndConditions !== undefined ? termsAndConditions : user.consents.termsAndConditions,
    privacyPolicy: privacyPolicy !== undefined ? privacyPolicy : user.consents.privacyPolicy,
    dataProcessing: dataProcessing !== undefined ? dataProcessing : user.consents.dataProcessing,
    consentDate: new Date()
  };

  // Save the updated user
  await user.save();

  res.json({
    consents: user.consents,
    message: 'Consent updated successfully'
  });
});

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'developmentsecret', {
    expiresIn: '30d',
  });
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getConsentStatus,
  updateConsentStatus
};