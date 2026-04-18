# LANDGUARD Frontend - Backend API Integration Guide

This document outlines the API endpoints and data structures needed to integrate the frontend with the backend.

## Properties Search Endpoint

### Endpoint
```
GET /api/properties
```

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| q | string | No | Search query (searches location and gpsAddress) |
| type | "all" \| "sale" \| "rent" | No | Filter by transaction type (default: "all") |
| region | string | No | Filter by region name |
| propertyType | string | No | Filter by property type (residential, commercial, vacant) |
| limit | number | No | Number of properties to return (default: 50, max: 100) |
| page | number | No | Pagination page number (default: 1) |

### Example Request
```
GET /api/properties?q=accra&type=sale&region=Greater%20Accra&limit=20&page=1
```

### Success Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "ownerId": "507f1f77bcf86cd799439012",
      "location": "East Legon, Accra",
      "gpsAddress": "GA-123-4567",
      "type": "sale",
      "price": "GHS 450,000",
      "size": "0.25 acres",
      "category": "Residential",
      "verified": true,
      "image": "https://landguard-bucket.s3.amazonaws.com/property-1.jpg",
      "views": 234,
      "saved": 12,
      "description": "Beautiful residential land in East Legon",
      "features": ["water", "electricity", "fenced"],
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
      },
      "createdAt": "2024-04-16T10:00:00Z",
      "updatedAt": "2024-04-16T10:00:00Z"
    }
    // ... more properties
  ],
  "total": 142,
  "page": 1,
  "limit": 20,
  "totalPages": 8
}
```

### Error Response (400 Bad Request)
```json
{
  "success": false,
  "message": "Invalid query parameters"
}
```

### Error Response (500 Internal Server Error)
```json
{
  "success": false,
  "message": "Server error while fetching properties"
}
```

## Property Detail Endpoint (Future)

```
GET /api/properties/:id
```

**Response**: Single property object with full details including owner info, high-res images, documents, etc.

## Property Creation Endpoint (Seller) (Future)

```
POST /api/properties
```

**Request Body**: Property details with documents for verification

## Property Update Endpoint (Seller) (Future)

```
PATCH /api/properties/:id
```

**Request Body**: Updated property details

## Important Notes

1. **Image URLs**: Use absolute URLs (full HTTP/HTTPS paths) for property images
2. **Pagination**: Implement proper pagination for large result sets
3. **Filtering**: Backend should apply all filters before returning results
4. **Verification Status**: Only show `verified: true` properties in search (non-verified can be shown with warning)
5. **Performance**: Consider indexing on location, type, region, and gpsAddress fields in MongoDB
6. **Caching**: Implement caching for frequently searched regions/locations

## Frontend Implementation

The frontend automatically:
- Sends search and filter parameters to the backend
- Shows loading skeleton while fetching
- Falls back to mock data if API is unavailable (for development)
- Displays error messages if the API fails
- Updates results when filters change

## Development Notes

- **Fallback Behavior**: The frontend currently uses MOCK_PROPERTIES as a fallback if the API is unavailable
- **API URL**: Requests are sent to `/api/properties` - ensure CORS is configured correctly
- **Error Handling**: The frontend logs errors but ensures a good UX by using mock data as fallback

## Next Steps

1. Implement the `/api/properties` endpoint in Node.js/Express backend
2. Connect to MongoDB and query using the provided filters
3. Implement pagination
4. Add proper error handling
5. Test with the frontend
