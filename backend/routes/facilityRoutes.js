const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const facilityController = require('../controllers/facilityController');

// Facility management
router.post('/', protect, facilityController.createFacility);
router.get('/', protect, facilityController.getFacilities);
router.get('/:id', protect, facilityController.getFacilityById);
router.put('/:id', protect, facilityController.updateFacility);
router.get('/:id/dashboard', protect, facilityController.getFacilityDashboard);

// Staff management
router.post('/:id/staff', protect, facilityController.addStaffMember);
router.put('/:id/staff/:userId', protect, facilityController.updateStaffMember);
router.delete('/:id/staff/:userId', protect, facilityController.removeStaffMember);

module.exports = router;