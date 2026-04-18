// Geospatial utilities for land parcel coordinates and distance calculations

// Calculate distance between two coordinates using Haversine formula
const calculateDistance = (coord1, coord2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = coord1[1] * Math.PI / 180; // latitude in radians
  const φ2 = coord2[1] * Math.PI / 180; // latitude in radians
  const Δφ = (coord2[1] - coord1[1]) * Math.PI / 180;
  const Δλ = (coord2[0] - coord1[0]) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // distance in meters
};

// Check if coordinates are within Ghana's boundaries
const isWithinGhana = (coordinates) => {
  const [longitude, latitude] = coordinates;

  // Ghana's approximate boundaries
  const bounds = {
    north: 11.5,
    south: 4.5,
    east: 1.5,
    west: -3.5
  };

  return latitude >= bounds.south &&
         latitude <= bounds.north &&
         longitude >= bounds.west &&
         longitude <= bounds.east;
};

// Validate coordinate format
const validateCoordinates = (coordinates) => {
  if (!Array.isArray(coordinates) || coordinates.length !== 2) {
    return false;
  }

  const [longitude, latitude] = coordinates;

  if (typeof longitude !== 'number' || typeof latitude !== 'number') {
    return false;
  }

  // Check if coordinates are within valid ranges
  if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
    return false;
  }

  return true;
};

// Convert coordinates to GeoJSON Point format
const toGeoJSONPoint = (coordinates) => {
  if (!validateCoordinates(coordinates)) {
    throw new Error('Invalid coordinates');
  }

  return {
    type: 'Point',
    coordinates: coordinates // [longitude, latitude]
  };
};

// Get bounding box for a center point and radius
const getBoundingBox = (centerCoordinates, radiusInMeters) => {
  const [centerLng, centerLat] = centerCoordinates;
  const radiusInDegrees = radiusInMeters / 111320; // Rough conversion

  return {
    minLng: centerLng - radiusInDegrees / Math.cos(centerLat * Math.PI / 180),
    maxLng: centerLng + radiusInDegrees / Math.cos(centerLat * Math.PI / 180),
    minLat: centerLat - radiusInDegrees,
    maxLat: centerLat + radiusInDegrees
  };
};

// Get Ghana regions with their approximate centers
const GHANA_REGIONS = {
  'Greater Accra': [-0.1869, 5.6037],
  'Ashanti': [-1.6731, 6.7470],
  'Central': [-1.3089, 5.5600],
  'Western': [-2.5000, 5.5000],
  'Eastern': [-0.5000, 6.5000],
  'Volta': [0.5000, 6.5000],
  'Northern': [-0.5000, 9.5000],
  'Upper East': [-0.5000, 10.5000],
  'Upper West': [-2.5000, 10.5000],
  'Oti': [0.5000, 8.0000],
  'Bono': [-2.5000, 7.5000],
  'Bono East': [-1.5000, 7.5000],
  'Ahafo': [-2.5000, 7.0000],
  'Savannah': [-1.5000, 9.0000],
  'North East': [0.5000, 10.0000],
  'Western North': [-2.5000, 6.5000]
};

// Get region center coordinates
const getRegionCenter = (regionName) => {
  return GHANA_REGIONS[regionName] || null;
};

// Calculate area of a polygon (for land parcels)
const calculatePolygonArea = (coordinates) => {
  // Using the shoelace formula for polygon area
  let area = 0;
  const n = coordinates.length;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += coordinates[i][0] * coordinates[j][1];
    area -= coordinates[j][0] * coordinates[i][1];
  }

  area = Math.abs(area) / 2;

  // Convert to square meters (rough approximation for small areas)
  // More accurate conversion would use proper geodesic calculations
  const EARTH_RADIUS = 6371000; // meters
  const lat = coordinates.reduce((sum, coord) => sum + coord[1], 0) / n;
  const meterPerDegree = Math.PI * EARTH_RADIUS * Math.cos(lat * Math.PI / 180) / 180;

  return Math.abs(area * meterPerDegree * meterPerDegree);
};

module.exports = {
  calculateDistance,
  isWithinGhana,
  validateCoordinates,
  toGeoJSONPoint,
  getBoundingBox,
  getRegionCenter,
  GHANA_REGIONS,
  calculatePolygonArea
};