const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const Property = require('../models/Property');

// @route   GET /api/analytics/seller
// @desc    Aggregated stats for the authenticated seller
// @access  Authenticated sellers
router.get('/seller', authenticate, asyncHandler(async (req, res) => {
  const properties = await Property.find({ seller: req.user.id }).select('title views saves inquiries status createdAt price');

  const totalProperties = properties.length;
  const totalViews      = properties.reduce((sum, p) => sum + (p.views || 0), 0);
  const totalSaves      = properties.reduce((sum, p) => sum + (p.saves || 0), 0);
  const totalInquiries  = properties.reduce((sum, p) => sum + (p.inquiries || 0), 0);
  const activeOffers    = properties.filter((p) => p.status === 'under_offer').length;
  const sold            = properties.filter((p) => p.status === 'sold').length;

  return res.json({
    success: true,
    data: {
      totalProperties,
      totalViews,
      totalSaves,
      totalInquiries,
      activeOffers,
      sold,
      revenue: 0, // populated once payments/transactions are confirmed
      properties: properties.map((p) => ({
        id:       p._id,
        title:    p.title,
        views:    p.views    || 0,
        saves:    p.saves    || 0,
        inquiries:p.inquiries|| 0,
        status:   p.status,
        price:    p.price,
        createdAt:p.createdAt
      }))
    }
  });
}));

// @route   GET /api/analytics/properties/:propertyId
// @desc    Stats for a single property (seller or admin only)
// @access  Authenticated
router.get('/properties/:propertyId', authenticate, asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.propertyId).select('seller title views saves inquiries status price createdAt');
  if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

  if (String(property.seller) !== String(req.user.id) &&
      !['admin', 'government_admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  return res.json({
    success: true,
    data: {
      id:        property._id,
      title:     property.title,
      views:     property.views     || 0,
      saves:     property.saves     || 0,
      inquiries: property.inquiries || 0,
      status:    property.status,
      price:     property.price,
      createdAt: property.createdAt
    }
  });
}));

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics (admin)
// @access  Private (Admin only)
router.get('/dashboard', authenticate, authorize('admin', 'government_admin'), (req, res) => {
  res.json({ success: false, message: 'Dashboard analytics endpoint not implemented yet' });
});

// @route   GET /api/analytics/properties
// @desc    Get property analytics (admin)
// @access  Private (Admin only)
router.get('/properties', authenticate, authorize('admin', 'government_admin'), (req, res) => {
  res.json({ success: false, message: 'Property analytics endpoint not implemented yet' });
});

// @route   GET /api/analytics/users
// @desc    Get user analytics (admin)
// @access  Private (Admin only)
router.get('/users', authenticate, authorize('admin', 'government_admin'), (req, res) => {
  res.json({ success: false, message: 'User analytics endpoint not implemented yet' });
});

// @route   GET /api/analytics/transactions
// @desc    Get transaction analytics (admin)
// @access  Private (Admin only)
router.get('/transactions', authenticate, authorize('admin', 'government_admin'), (req, res) => {
  res.json({ success: false, message: 'Transaction analytics endpoint not implemented yet' });
});

// @route   GET /api/analytics/regional
// @desc    Get regional analytics (admin)
// @access  Private (Admin only)
router.get('/regional', authenticate, authorize('admin', 'government_admin'), (req, res) => {
  res.json({ success: false, message: 'Regional analytics endpoint not implemented yet' });
});

module.exports = router;