const { body, param, query, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Property validation rules
const validatePropertyCreation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),

  body('description')
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be between 20 and 2000 characters'),

  body('price')
    .isNumeric()
    .withMessage('Price must be a valid number')
    .isFloat({ min: 0 })
    .withMessage('Price must be positive'),

  body('propertyType')
    .isIn(['land', 'house', 'apartment', 'commercial', 'industrial'])
    .withMessage('Invalid property type'),

  body('transactionType')
    .isIn(['sale', 'lease', 'rental'])
    .withMessage('Invalid transaction type'),

  body('location.address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),

  body('location.region')
    .isIn(['Greater Accra', 'Ashanti', 'Central', 'Western', 'Eastern', 'Volta', 'Northern', 'Upper East', 'Upper West', 'Oti', 'Bono', 'Bono East', 'Ahafo', 'Savannah', 'North East', 'Western North'])
    .withMessage('Invalid region'),

  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be an array of [longitude, latitude]'),

  body('size')
    .optional()
    .isNumeric()
    .withMessage('Size must be a valid number')
    .isFloat({ min: 0 })
    .withMessage('Size must be positive'),

  handleValidationErrors
];

const validatePropertyUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be between 20 and 2000 characters'),

  body('price')
    .optional()
    .isNumeric()
    .withMessage('Price must be a valid number')
    .isFloat({ min: 0 })
    .withMessage('Price must be positive'),

  body('propertyType')
    .optional()
    .isIn(['land', 'house', 'apartment', 'commercial', 'industrial'])
    .withMessage('Invalid property type'),

  body('transactionType')
    .optional()
    .isIn(['sale', 'lease', 'rental'])
    .withMessage('Invalid transaction type'),

  body('location.address')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Address is required'),

  body('location.region')
    .optional()
    .isIn(['Greater Accra', 'Ashanti', 'Central', 'Western', 'Eastern', 'Volta', 'Northern', 'Upper East', 'Upper West', 'Oti', 'Bono', 'Bono East', 'Ahafo', 'Savannah', 'North East', 'Western North'])
    .withMessage('Invalid region'),

  body('location.coordinates')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be an array of [longitude, latitude]'),

  body('size')
    .optional()
    .isNumeric()
    .withMessage('Size must be a valid number')
    .isFloat({ min: 0 })
    .withMessage('Size must be positive'),

  handleValidationErrors
];

// User validation rules
const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),

  body('phone')
    .matches(/^(\+233|0)[0-9]{9}$/)
    .withMessage('Valid Ghana phone number is required'),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),

  body('role')
    .isIn(['buyer', 'seller'])
    .withMessage('Role must be either buyer or seller'),

  body('ghanaCardNumber')
    .optional()
    .matches(/^[A-Z]{2}\d{9}[A-Z]$/)
    .withMessage('Valid Ghana Card number format required'),

  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  handleValidationErrors
];

// Transaction validation rules
const validateTransactionInitiation = [
  body('propertyId')
    .isMongoId()
    .withMessage('Valid property ID is required'),

  body('amount')
    .isNumeric()
    .withMessage('Amount must be a valid number')
    .isFloat({ min: 0 })
    .withMessage('Amount must be positive'),

  body('transactionType')
    .isIn(['sale', 'lease', 'rental'])
    .withMessage('Invalid transaction type'),

  body('paymentMethod')
    .isIn(['bank_transfer', 'mobile_money', 'card', 'cash'])
    .withMessage('Invalid payment method'),

  handleValidationErrors
];

// Search validation rules
const validatePropertySearch = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('minPrice')
    .optional()
    .isNumeric()
    .withMessage('Minimum price must be a valid number'),

  query('maxPrice')
    .optional()
    .isNumeric()
    .withMessage('Maximum price must be a valid number'),

  query('propertyType')
    .optional()
    .isIn(['land', 'house', 'apartment', 'commercial', 'industrial'])
    .withMessage('Invalid property type'),

  query('transactionType')
    .optional()
    .isIn(['sale', 'lease', 'rental'])
    .withMessage('Invalid transaction type'),

  query('region')
    .optional()
    .isIn(['Greater Accra', 'Ashanti', 'Central', 'Western', 'Eastern', 'Volta', 'Northern', 'Upper East', 'Upper West', 'Oti', 'Bono', 'Bono East', 'Ahafo', 'Savannah', 'North East', 'Western North'])
    .withMessage('Invalid region'),

  handleValidationErrors
];

const validateNearbySearch = [
  query('longitude')
    .isNumeric()
    .withMessage('Longitude must be a valid number')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),

  query('latitude')
    .isNumeric()
    .withMessage('Latitude must be a valid number')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  query('maxDistance')
    .optional()
    .isNumeric()
    .withMessage('Max distance must be a valid number')
    .isFloat({ min: 0, max: 50000 })
    .withMessage('Max distance must be between 0 and 50000 meters'),

  handleValidationErrors
];

module.exports = {
  validatePropertyCreation,
  validatePropertyUpdate,
  validateUserRegistration,
  validateUserLogin,
  validateTransactionInitiation,
  validatePropertySearch,
  validateNearbySearch,
  handleValidationErrors
};