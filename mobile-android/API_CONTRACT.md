# API Contract & Specification

This document defines the API contracts between the Flutter Android mobile app and the backend REST API.

## Base URL

```
Development: http://192.168.1.100:8080/api
Staging: https://staging-api.example.com/api
Production: https://api.example.com/api
```

## Authentication

All API requests (except login/register) must include Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Data Formats

- **Request/Response Format**: JSON
- **Date Format**: ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)
- **Amount Format**: Decimal with 2 places (e.g., 2500.00)
- **Phone Format**: International (e.g., +94XXXXXXXXX)

## Error Handling

All error responses follow this format:

```json
{
  "status": "error",
  "code": "ERROR_CODE",
  "message": "Error description",
  "timestamp": "2024-05-14T10:30:00.000Z"
}
```

### Common Error Codes

- `INVALID_REQUEST`: Malformed request
- `UNAUTHORIZED`: Invalid/expired token
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Duplicate entry
- `INTERNAL_ERROR`: Server error
- `PAYMENT_FAILED`: Payment processing error

## Endpoints

### Authentication

#### Register

**Endpoint**: `POST /auth/register`

**Request**:
```json
{
  "licenseNumber": "L/SL/2023/123456",
  "email": "driver@example.com",
  "password": "SecurePassword123",
  "phoneNumber": "+94771234567",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-123",
      "licenseNumber": "L/SL/2023/123456",
      "email": "driver@example.com",
      "phoneNumber": "+94771234567",
      "firstName": "John",
      "lastName": "Doe",
      "licenseExpiryDate": "2026-05-14",
      "createdAt": "2024-05-14T10:30:00.000Z"
    }
  }
}
```

#### Login

**Endpoint**: `POST /auth/login`

**Request**:
```json
{
  "email": "driver@example.com",
  "password": "SecurePassword123"
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-123",
      "licenseNumber": "L/SL/2023/123456",
      "email": "driver@example.com",
      "phoneNumber": "+94771234567",
      "firstName": "John",
      "lastName": "Doe",
      "licenseExpiryDate": "2026-05-14",
      "createdAt": "2024-05-14T10:30:00.000Z"
    }
  }
}
```

### Fine Management

#### Validate Fine

**Endpoint**: `GET /fines/validate?referenceNumber={refNum}&categoryId={catId}`

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "id": "fine-123",
    "referenceNumber": "RF20240514001",
    "categoryId": "C001",
    "categoryName": "Speeding",
    "amount": 2500.00,
    "violationDescription": "Exceeding speed limit on Main Road",
    "issueDate": "2024-05-10T14:30:00.000Z",
    "driverId": "user-123",
    "vehicleNumber": "ABC-1234",
    "status": "PENDING"
  }
}
```

### Payment Management

#### Create Payment

**Endpoint**: `POST /payments`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request**:
```json
{
  "fineId": "fine-123",
  "paymentMethod": "CARD"
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "data": {
    "id": "payment-456",
    "fineId": "fine-123",
    "referenceNumber": "RF20240514001",
    "amount": 2500.00,
    "paymentMethod": "CARD",
    "status": "PENDING",
    "paymentDate": "2024-05-14T10:30:00.000Z"
  }
}
```

#### Get Payment Status

**Endpoint**: `GET /payments/{paymentId}`

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "id": "payment-456",
    "fineId": "fine-123",
    "referenceNumber": "RF20240514001",
    "amount": 2500.00,
    "paymentMethod": "CARD",
    "status": "COMPLETED",
    "transactionId": "TXN-789",
    "paymentDate": "2024-05-14T10:30:00.000Z",
    "receiptUrl": "https://api.example.com/receipts/receipt-456.pdf",
    "notes": null
  }
}
```

#### Verify Payment

**Endpoint**: `POST /payments/{paymentId}/verify`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request**:
```json
{
  "transactionId": "TXN-789"
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "id": "payment-456",
    "status": "COMPLETED",
    "verificationStatus": "SUCCESS",
    "message": "Payment verified successfully. SMS sent to officer."
  }
}
```

#### Get Payment History

**Endpoint**: `GET /payments/history?page=1&limit=20`

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "payments": [
      {
        "id": "payment-456",
        "fineId": "fine-123",
        "referenceNumber": "RF20240514001",
        "amount": 2500.00,
        "paymentMethod": "CARD",
        "status": "COMPLETED",
        "transactionId": "TXN-789",
        "paymentDate": "2024-05-14T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "pages": 1
    }
  }
}
```

### User Management

#### Get User Profile

**Endpoint**: `GET /users/profile`

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "id": "user-123",
    "licenseNumber": "L/SL/2023/123456",
    "email": "driver@example.com",
    "phoneNumber": "+94771234567",
    "firstName": "John",
    "lastName": "Doe",
    "licenseExpiryDate": "2026-05-14",
    "createdAt": "2024-05-14T10:30:00.000Z"
  }
}
```

## Rate Limiting

- Requests per minute: 60
- Requests per hour: 1000
- Response header: `X-RateLimit-Remaining`

## Timeout

- Connection timeout: 30 seconds
- Read timeout: 30 seconds
- Write timeout: 30 seconds

## Status Codes

- `200`: OK
- `201`: Created
- `204`: No Content
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `500`: Internal Server Error
- `503`: Service Unavailable

## Example Request/Response Flow

### Login Flow
```
1. User enters email and password
2. App calls POST /auth/login
3. Backend validates credentials
4. Backend returns token and user data
5. App stores token in secure storage
6. App navigates to home screen
```

### Payment Flow
```
1. User enters fine reference and category
2. App calls GET /fines/validate
3. Backend validates and returns fine details
4. User selects payment method
5. App calls POST /payments
6. Backend initializes payment and returns payment ID
7. User completes payment with gateway
8. App calls POST /payments/{paymentId}/verify
9. Backend verifies transaction with payment gateway
10. Backend sends SMS to officer
11. Backend returns success response
12. App shows confirmation
```

## Implementation Notes

- All timestamps are in UTC
- Token expiry: 24 hours (can be configured)
- Implement retry logic for transient failures
- Use exponential backoff for rate limit retries
- Cache user profile locally for offline access
- Encrypt sensitive data in local storage
- Log API errors for debugging
