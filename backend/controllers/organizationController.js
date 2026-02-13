const Organization = require('../models/organizationModel');
const logger = require('../utils/logger');

// @desc    Create organization
// @route   POST /api/organizations
const createOrganization = async (req, res) => {
  try {
    const { name, type, contact, npiNumber } = req.body;

    const org = await Organization.create({
      name,
      type: type || 'practice',
      owner: req.user._id || req.user.id,
      members: [
        {
          user: req.user._id || req.user.id,
          role: 'owner',
          status: 'active',
          joinedAt: new Date(),
        },
      ],
      contact,
      npiNumber,
    });

    res.status(201).json({ success: true, data: org });
  } catch (error) {
    logger.error(`Create org error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to create organization' });
  }
};

// @desc    Get user's organizations
// @route   GET /api/organizations
const getMyOrganizations = async (req, res) => {
  try {
    const orgs = await Organization.find({
      'members.user': req.user._id || req.user.id,
      isActive: true,
    });

    res.json({ success: true, data: orgs });
  } catch (error) {
    logger.error(`Get orgs error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to get organizations' });
  }
};

// @desc    Get single organization
// @route   GET /api/organizations/:id
const getOrganization = async (req, res) => {
  try {
    const org = await Organization.findById(req.params.id).populate('members.user', 'firstName lastName email');

    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }

    res.json({ success: true, data: org });
  } catch (error) {
    logger.error(`Get org error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to get organization' });
  }
};

// @desc    Update organization
// @route   PUT /api/organizations/:id
const updateOrganization = async (req, res) => {
  try {
    const org = await Organization.findById(req.params.id);

    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }

    const userId = (req.user._id || req.user.id).toString();
    const isOwnerOrAdmin = org.members.some(
      (m) => m.user.toString() === userId && ['owner', 'admin'].includes(m.role)
    );

    if (!isOwnerOrAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this organization' });
    }

    const { name, type, contact, settings, npiNumber } = req.body;
    if (name) org.name = name;
    if (type) org.type = type;
    if (contact) org.contact = { ...org.contact, ...contact };
    if (settings) org.settings = { ...org.settings, ...settings };
    if (npiNumber) org.npiNumber = npiNumber;

    await org.save();
    res.json({ success: true, data: org });
  } catch (error) {
    logger.error(`Update org error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to update organization' });
  }
};

// @desc    Invite member to organization
// @route   POST /api/organizations/:id/members
const inviteMember = async (req, res) => {
  try {
    const { email, role } = req.body;
    const org = await Organization.findById(req.params.id);

    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }

    // In a real app, you'd look up the user by email and send an invitation email
    res.json({
      success: true,
      data: { message: `Invitation sent to ${email} as ${role || 'member'}` },
    });
  } catch (error) {
    logger.error(`Invite member error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to invite member' });
  }
};

// @desc    Remove member from organization
// @route   DELETE /api/organizations/:id/members/:userId
const removeMember = async (req, res) => {
  try {
    const org = await Organization.findById(req.params.id);

    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }

    org.members = org.members.filter((m) => m.user.toString() !== req.params.userId);
    await org.save();

    res.json({ success: true, data: { message: 'Member removed' } });
  } catch (error) {
    logger.error(`Remove member error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to remove member' });
  }
};

module.exports = {
  createOrganization,
  getMyOrganizations,
  getOrganization,
  updateOrganization,
  inviteMember,
  removeMember,
};
