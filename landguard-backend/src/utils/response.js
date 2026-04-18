// Standardized API response utilities

// Success response
const successResponse = (res, message, data = null, statusCode = 200) => {
  const response = {
    success: true,
    message
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

// Error response
const errorResponse = (res, message, statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

// Pagination helper
const paginationResponse = (res, message, data, pagination, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination
  });
};

// Create pagination info
const createPaginationInfo = (page, limit, total, baseUrl = '') => {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    currentPage: page,
    totalPages,
    totalItems: total,
    itemsPerPage: limit,
    hasNext,
    hasPrev,
    nextPage: hasNext ? page + 1 : null,
    prevPage: hasPrev ? page - 1 : null,
    links: {
      first: `${baseUrl}?page=1&limit=${limit}`,
      last: `${baseUrl}?page=${totalPages}&limit=${limit}`,
      next: hasNext ? `${baseUrl}?page=${page + 1}&limit=${limit}` : null,
      prev: hasPrev ? `${baseUrl}?page=${page - 1}&limit=${limit}` : null
    }
  };
};

// Data transformation helpers
const transformPropertyData = (property) => {
  return {
    id: property._id,
    title: property.title,
    description: property.description,
    price: property.price,
    currency: property.currency,
    propertyType: property.propertyType,
    transactionType: property.transactionType,
    location: property.location,
    size: property.size,
    features: property.features,
    images: property.images,
    isVerified: property.isVerified,
    isAvailable: property.isAvailable,
    seller: {
      id: property.seller._id,
      name: property.seller.name,
      avatar: property.seller.avatar,
      isVerified: property.seller.isVerified
    },
    createdAt: property.createdAt,
    updatedAt: property.updatedAt
  };
};

const transformUserData = (user, includeSensitive = false) => {
  const baseData = {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatar: user.avatar,
    isVerified: user.isVerified,
    createdAt: user.createdAt
  };

  if (includeSensitive) {
    baseData.ghanaCardNumber = user.ghanaCardNumber;
    baseData.verificationDocuments = user.verificationDocuments;
    baseData.isActive = user.isActive;
  }

  return baseData;
};

const transformTransactionData = (transaction) => {
  return {
    id: transaction._id,
    property: {
      id: transaction.property._id,
      title: transaction.property.title,
      location: transaction.property.location
    },
    buyer: {
      id: transaction.buyer._id,
      name: transaction.buyer.name
    },
    seller: {
      id: transaction.seller._id,
      name: transaction.seller.name
    },
    amount: transaction.amount,
    currency: transaction.currency,
    status: transaction.status,
    transactionType: transaction.transactionType,
    paymentMethod: transaction.paymentMethod,
    createdAt: transaction.createdAt,
    updatedAt: transaction.updatedAt
  };
};

module.exports = {
  successResponse,
  errorResponse,
  paginationResponse,
  createPaginationInfo,
  transformPropertyData,
  transformUserData,
  transformTransactionData
};