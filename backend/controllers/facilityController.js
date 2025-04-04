const asyncHandler = require('../utils/asyncHandler');
const Facility = require('../models/facilityModel');
const User = require('../models/userModel');
const mongoose = require('mongoose');

// @desc    Create a new facility
// @route   POST /api/facilities
// @access  Private (Admin only)
const createFacility = asyncHandler(async (req, res) => {
  const {
    name,
    type,
    address,
    contactInfo,
    identifiers,
    defaultSettings
  } = req.body;
  
  // Validate required fields
  if (!name) {
    res.status(400);
    throw new Error('Facility name is required');
  }
  
  // Create the facility with the current user as administrator
  const facility = new Facility({
    name,
    type: type || 'hospital',
    address: address || {},
    contactInfo: contactInfo || {},
    identifiers: identifiers || {},
    administrators: [req.user.id],
    defaultSettings: defaultSettings || {}
  });
  
  const savedFacility = await facility.save();
  
  res.status(201).json({
    _id: savedFacility._id,
    name: savedFacility.name,
    type: savedFacility.type,
    message: 'Facility created successfully'
  });
});

// @desc    Get all facilities for the current user
// @route   GET /api/facilities
// @access  Private
const getFacilities = asyncHandler(async (req, res) => {
  // Find facilities where the user is an administrator or staff member
  const facilities = await Facility.find({
    $or: [
      { administrators: req.user.id },
      { 'staff.user': req.user.id }
    ]
  }).select('name type address contactInfo isActive');
  
  res.json(facilities);
});

// @desc    Get a facility by ID
// @route   GET /api/facilities/:id
// @access  Private (Facility Staff)
const getFacilityById = asyncHandler(async (req, res) => {
  const facilityId = req.params.id;
  
  // Find the facility
  const facility = await Facility.findById(facilityId);
  
  if (!facility) {
    res.status(404);
    throw new Error('Facility not found');
  }
  
  // Check if user is authorized to view this facility
  const isUserAuthorized = facility.administrators.includes(req.user.id) || 
                           facility.staff.some(s => s.user.toString() === req.user.id.toString());
                           
  if (!isUserAuthorized) {
    res.status(401);
    throw new Error('Not authorized to view this facility');
  }
  
  res.json(facility);
});

// @desc    Update a facility
// @route   PUT /api/facilities/:id
// @access  Private (Facility Admin)
const updateFacility = asyncHandler(async (req, res) => {
  const facilityId = req.params.id;
  const {
    name,
    type,
    address,
    contactInfo,
    identifiers,
    defaultSettings,
    isActive
  } = req.body;
  
  // Find the facility
  const facility = await Facility.findById(facilityId);
  
  if (!facility) {
    res.status(404);
    throw new Error('Facility not found');
  }
  
  // Check if user is an administrator
  if (!facility.administrators.includes(req.user.id)) {
    res.status(401);
    throw new Error('Not authorized to update this facility');
  }
  
  // Update fields
  facility.name = name || facility.name;
  facility.type = type || facility.type;
  
  if (address) {
    facility.address = {
      ...facility.address,
      ...address
    };
  }
  
  if (contactInfo) {
    facility.contactInfo = {
      ...facility.contactInfo,
      ...contactInfo
    };
  }
  
  if (identifiers) {
    facility.identifiers = {
      ...facility.identifiers,
      ...identifiers
    };
  }
  
  if (defaultSettings) {
    facility.defaultSettings = {
      ...facility.defaultSettings,
      ...defaultSettings
    };
  }
  
  if (isActive !== undefined) {
    facility.isActive = isActive;
  }
  
  facility.updatedAt = Date.now();
  
  // Save the updates
  const updatedFacility = await facility.save();
  
  res.json({
    _id: updatedFacility._id,
    name: updatedFacility.name,
    message: 'Facility updated successfully'
  });
});

// @desc    Add a staff member to a facility
// @route   POST /api/facilities/:id/staff
// @access  Private (Facility Admin)
const addStaffMember = asyncHandler(async (req, res) => {
  const facilityId = req.params.id;
  const { email, role, permissions } = req.body;
  
  if (!email || !role) {
    res.status(400);
    throw new Error('Email and role are required');
  }
  
  // Find the facility
  const facility = await Facility.findById(facilityId);
  
  if (!facility) {
    res.status(404);
    throw new Error('Facility not found');
  }
  
  // Check if user is an administrator
  if (!facility.administrators.includes(req.user.id)) {
    res.status(401);
    throw new Error('Not authorized to add staff to this facility');
  }
  
  // Find the user by email
  const user = await User.findOne({ email });
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  // Check if the user is already a staff member
  if (facility.staff.some(s => s.user.toString() === user._id.toString())) {
    res.status(400);
    throw new Error('User is already a staff member at this facility');
  }
  
  // Add the user as a staff member
  const staffMember = {
    user: user._id,
    role,
    permissions: permissions || {
      canUploadDocuments: true,
      canGenerateAppeals: true,
      canSubmitAppeals: role === 'admin' || role === 'manager',
      canViewAll: role === 'admin' || role === 'manager',
      canManageUsers: role === 'admin'
    }
  };
  
  facility.staff.push(staffMember);
  
  // If role is admin, also add to administrators array
  if (role === 'admin' && !facility.administrators.includes(user._id)) {
    facility.administrators.push(user._id);
  }
  
  await facility.save();
  
  res.json({
    message: 'Staff member added successfully',
    staffMember: {
      userId: user._id,
      name: user.name,
      email: user.email,
      role
    }
  });
});

// @desc    Update a staff member's role or permissions
// @route   PUT /api/facilities/:id/staff/:userId
// @access  Private (Facility Admin)
const updateStaffMember = asyncHandler(async (req, res) => {
  const { id: facilityId, userId } = req.params;
  const { role, permissions } = req.body;
  
  // Find the facility
  const facility = await Facility.findById(facilityId);
  
  if (!facility) {
    res.status(404);
    throw new Error('Facility not found');
  }
  
  // Check if user is an administrator
  if (!facility.administrators.includes(req.user.id)) {
    res.status(401);
    throw new Error('Not authorized to update staff members');
  }
  
  // Find the staff member
  const staffMemberIndex = facility.staff.findIndex(s => s.user.toString() === userId);
  
  if (staffMemberIndex === -1) {
    res.status(404);
    throw new Error('Staff member not found');
  }
  
  // Update the staff member
  if (role) {
    facility.staff[staffMemberIndex].role = role;
    
    // Handle admin role changes
    if (role === 'admin' && !facility.administrators.includes(userId)) {
      facility.administrators.push(mongoose.Types.ObjectId(userId));
    } else if (role !== 'admin' && facility.administrators.includes(userId)) {
      facility.administrators = facility.administrators.filter(
        id => id.toString() !== userId
      );
    }
  }
  
  if (permissions) {
    facility.staff[staffMemberIndex].permissions = {
      ...facility.staff[staffMemberIndex].permissions,
      ...permissions
    };
  }
  
  await facility.save();
  
  res.json({
    message: 'Staff member updated successfully',
    staffMember: facility.staff[staffMemberIndex]
  });
});

// @desc    Remove a staff member from a facility
// @route   DELETE /api/facilities/:id/staff/:userId
// @access  Private (Facility Admin)
const removeStaffMember = asyncHandler(async (req, res) => {
  const { id: facilityId, userId } = req.params;
  
  // Find the facility
  const facility = await Facility.findById(facilityId);
  
  if (!facility) {
    res.status(404);
    throw new Error('Facility not found');
  }
  
  // Check if user is an administrator
  if (!facility.administrators.includes(req.user.id)) {
    res.status(401);
    throw new Error('Not authorized to remove staff members');
  }
  
  // Check that the user isn't removing themselves as the last admin
  if (userId === req.user.id.toString() && 
      facility.administrators.length === 1 && 
      facility.administrators[0].toString() === req.user.id.toString()) {
    res.status(400);
    throw new Error('Cannot remove yourself as the last administrator');
  }
  
  // Remove from staff array
  facility.staff = facility.staff.filter(s => s.user.toString() !== userId);
  
  // Also remove from administrators array if present
  facility.administrators = facility.administrators.filter(
    id => id.toString() !== userId
  );
  
  await facility.save();
  
  res.json({ message: 'Staff member removed successfully' });
});

// @desc    Get facility dashboard summary
// @route   GET /api/facilities/:id/dashboard
// @access  Private (Facility Staff)
const getFacilityDashboard = asyncHandler(async (req, res) => {
  const facilityId = req.params.id;
  
  // Find the facility
  const facility = await Facility.findById(facilityId);
  
  if (!facility) {
    res.status(404);
    throw new Error('Facility not found');
  }
  
  // Check if user is authorized to view this facility
  const isUserAuthorized = facility.administrators.includes(req.user.id) || 
                           facility.staff.some(s => s.user.toString() === req.user.id.toString());
                           
  if (!isUserAuthorized) {
    res.status(401);
    throw new Error('Not authorized to view this facility dashboard');
  }
  
  // Get recent batches
  const recentBatches = await mongoose.model('Batch')
    .find({ facility: facilityId })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('batchId name status processingStats createdAt');
  
  // Get appeal stats from facility
  const { stats } = facility;
  
  // Calculate success rate if available
  const successRate = stats.totalAppeals > 0 ? stats.successfulAppeals / stats.totalAppeals : 0;
  
  res.json({
    facilityId,
    facilityName: facility.name,
    summary: {
      totalAppeals: stats.totalAppeals,
      pendingAppeals: stats.pendingAppeals,
      successRate: successRate,
      totalRecovered: stats.totalRecovered
    },
    recentBatches,
    appealBreakdown: {
      byType: Object.fromEntries(stats.appealsByType),
      byInsurer: Object.fromEntries(stats.appealsByInsurer),
      successRateByType: Object.fromEntries(stats.successRateByType)
    }
  });
});

module.exports = {
  createFacility,
  getFacilities,
  getFacilityById,
  updateFacility,
  addStaffMember,
  updateStaffMember,
  removeStaffMember,
  getFacilityDashboard
};