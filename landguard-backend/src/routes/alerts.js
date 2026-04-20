const express = require('express');
const { body, validationResult } = require('express-validator');
const PropertyAlert = require('../models/PropertyAlert');
const { authenticate } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }
  next();
};

// GET /api/alerts — list authenticated user's alerts
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const alerts = await PropertyAlert.find({ user: req.user.id, active: true }).sort({ createdAt: -1 });
  return res.json({ success: true, data: alerts });
}));

// POST /api/alerts — create a new alert
router.post('/', authenticate, [
  body('label').optional().isString().trim().isLength({ max: 100 }),
  body('region').optional().isString().trim(),
  body('district').optional().isString().trim(),
  body('priceMin').optional().isFloat({ min: 0 }),
  body('priceMax').optional().isFloat({ min: 0 }),
  body('category').optional().isIn(['residential', 'commercial', 'vacant', 'any']),
  body('type').optional().isIn(['sale', 'rent', 'any']),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const { label, region, district, priceMin, priceMax, category, type } = req.body;

  const alert = await PropertyAlert.create({
    user:     req.user.id,
    label,
    region,
    district,
    priceMin,
    priceMax,
    category: category || 'any',
    type:     type     || 'any'
  });

  return res.status(201).json({ success: true, data: alert });
}));

// DELETE /api/alerts/:id — delete (deactivate) an alert
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const alert = await PropertyAlert.findOne({ _id: req.params.id, user: req.user.id });
  if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });

  alert.active = false;
  await alert.save();
  return res.json({ success: true, message: 'Alert deleted' });
}));

module.exports = router;
