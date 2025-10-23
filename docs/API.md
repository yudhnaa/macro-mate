# API Documentation

## Base URL

```
Development: http://localhost:8000
Production: https://api.macromate.com (example)
```

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

---

## Table of Contents

- [Health Check Endpoints](#health-check-endpoints)
- [Authentication Endpoints](#authentication-endpoints)
- [User Profile Endpoints](#user-profile-endpoints)
- [Food Management Endpoints](#food-management-endpoints)
- [Analysis Endpoints](#analysis-endpoints)
- [Nutrition Advice Endpoints](#nutrition-advice-endpoints)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

---

## Health Check Endpoints

### Root

**GET** `/`

Check if API is running.

**Response:** `200 OK`

```json
{
	"message": "Welcome to Macro Mate API"
}
```

---

### Health Check

**GET** `/health`

Check API health status.

**Response:** `200 OK`

```json
{
	"status": "healthy"
}
```

---

## Authentication Endpoints

### Register New User

**POST** `/auth/register`

Creates a new user account.

**Request Body:**

```json
{
	"username": "string",
	"email": "user@example.com",
	"password": "string",
	"full_name": "string"
}
```

**Response:** `201 Created`

```json
{
	"id": "uuid",
	"username": "string",
	"email": "user@example.com",
	"created_at": "2025-01-01T00:00:00Z"
}
```

**Errors:**

- `400` - Invalid input data
- `409` - Username or email already exists

---

### User Login

**POST** `/auth/login`

Authenticate user and receive JWT token.

**Request Body:**

```json
{
	"username": "string",
	"password": "string"
}
```

**Response:** `200 OK`

```json
{
	"access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
	"token_type": "bearer",
	"expires_in": 604800
}
```

**Errors:**

- `401` - Invalid credentials
- `400` - Missing required fields

---

### Login For Access Token

**POST** `/auth/token`

OAuth2 compatible token endpoint.

**Request Body (Form Data):**

```
username=string
password=string
```

**Response:** `200 OK`

```json
{
	"access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
	"token_type": "bearer"
}
```

**Errors:**

- `401` - Invalid credentials
- `400` - Missing required fields

---

### Get Current User

**GET** `/auth/me`

Get authenticated user information.

**Headers:**

```http
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
	"id": "uuid",
	"username": "string",
	"email": "user@example.com",
	"created_at": "2025-01-01T00:00:00Z"
}
```

**Errors:**

- `401` - Invalid or expired token

---

## User Profile Endpoints

### Get User Profile

**GET** `/profile/me`

Retrieve user profile and health information.

**Headers:**

```http
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
	"id": "uuid",
	"user_id": "uuid",
	"full_name": "John Doe",
	"age": 30,
	"gender": "male",
	"weight": 75.5,
	"height": 175.0,
	"activity_level": "moderate",
	"goal": "maintain",
	"daily_calorie_target": 2200,
	"created_at": "2025-01-01T00:00:00Z",
	"updated_at": "2025-01-01T00:00:00Z"
}
```

**Errors:**

- `404` - Profile not found
- `401` - Unauthorized

---

### Create User Profile

**POST** `/profile/me`

Create a new user profile.

**Headers:**

```http
Authorization: Bearer <token>
```

**Request Body:**

```json
{
	"full_name": "John Doe",
	"age": 30,
	"gender": "male",
	"weight": 75.5,
	"height": 175.0,
	"activity_level": "moderate",
	"goal": "maintain"
}
```

**Response:** `201 Created`

```json
{
	"id": "uuid",
	"user_id": "uuid",
	"full_name": "John Doe",
	"age": 30,
	"gender": "male",
	"weight": 75.5,
	"height": 175.0,
	"activity_level": "moderate",
	"goal": "maintain",
	"daily_calorie_target": 2200,
	"created_at": "2025-01-01T00:00:00Z",
	"updated_at": "2025-01-01T00:00:00Z"
}
```

**Errors:**

- `400` - Invalid input data
- `409` - Profile already exists
- `401` - Unauthorized

---

### Update User Profile

**PUT** `/profile/me`

Update user profile information (full update).

**Headers:**

```http
Authorization: Bearer <token>
```

**Request Body:**

```json
{
	"full_name": "John Doe",
	"age": 30,
	"gender": "male",
	"weight": 75.5,
	"height": 175.0,
	"activity_level": "moderate",
	"goal": "lose_weight"
}
```

**Response:** `200 OK`

```json
{
	"id": "uuid",
	"user_id": "uuid",
	"full_name": "John Doe",
	"age": 30,
	"gender": "male",
	"weight": 75.5,
	"height": 175.0,
	"activity_level": "moderate",
	"goal": "lose_weight",
	"daily_calorie_target": 2000,
	"updated_at": "2025-01-01T00:00:00Z"
}
```

**Errors:**

- `400` - Invalid input data
- `401` - Unauthorized
- `404` - Profile not found

---

### Partial Update User Profile

**PATCH** `/profile/me`

Partially update user profile information.

**Headers:**

```http
Authorization: Bearer <token>
```

**Request Body:**

```json
{
	"weight": 73.5,
	"goal": "lose_weight"
}
```

**Response:** `200 OK`

```json
{
	"id": "uuid",
	"user_id": "uuid",
	"full_name": "John Doe",
	"age": 30,
	"gender": "male",
	"weight": 73.5,
	"height": 175.0,
	"activity_level": "moderate",
	"goal": "lose_weight",
	"daily_calorie_target": 2000,
	"updated_at": "2025-01-01T00:00:00Z"
}
```

**Errors:**

- `400` - Invalid input data
- `401` - Unauthorized
- `404` - Profile not found

---

## Food Management Endpoints

### List All Foods

**GET** `/foods/`

Get all food entries for the authenticated user.

**Headers:**

```http
Authorization: Bearer <token>
```

**Query Parameters:**

- `skip` (integer, optional): Number of records to skip (default: 0)
- `limit` (integer, optional): Maximum number of records to return (default: 100)
- `search` (string, optional): Search by food name

**Response:** `200 OK`

```json
{
	"total": 50,
	"items": [
		{
			"id": "uuid",
			"user_id": "uuid",
			"name": "Grilled Chicken",
			"calories": 165,
			"protein": 31,
			"carbs": 0,
			"fats": 3.6,
			"serving_size": "100g",
			"image_url": "https://res.cloudinary.com/...",
			"created_at": "2025-01-01T00:00:00Z"
		}
	]
}
```

---

### Create Food Entry

**POST** `/foods/`

Create a new food entry.

**Headers:**

```http
Authorization: Bearer <token>
```

**Request Body:**

```json
{
	"name": "Grilled Chicken",
	"calories": 165,
	"protein": 31,
	"carbs": 0,
	"fats": 3.6,
	"serving_size": "100g",
	"image_url": "https://res.cloudinary.com/..."
}
```

**Response:** `201 Created`

```json
{
	"id": "uuid",
	"user_id": "uuid",
	"name": "Grilled Chicken",
	"calories": 165,
	"protein": 31,
	"carbs": 0,
	"fats": 3.6,
	"serving_size": "100g",
	"image_url": "https://res.cloudinary.com/...",
	"created_at": "2025-01-01T00:00:00Z"
}
```

**Errors:**

- `400` - Invalid input data
- `401` - Unauthorized

---

### Get Food by ID

**GET** `/foods/{food_id}`

Retrieve a specific food entry.

**Headers:**

```http
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
	"id": "uuid",
	"user_id": "uuid",
	"name": "Grilled Chicken",
	"calories": 165,
	"protein": 31,
	"carbs": 0,
	"fats": 3.6,
	"serving_size": "100g",
	"image_url": "https://res.cloudinary.com/...",
	"created_at": "2025-01-01T00:00:00Z"
}
```

**Errors:**

- `404` - Food not found
- `401` - Unauthorized

---

### Update Food Entry

**PUT** `/foods/{food_id}`

Update an existing food entry.

**Headers:**

```http
Authorization: Bearer <token>
```

**Request Body:**

```json
{
	"name": "Grilled Chicken Breast",
	"calories": 170,
	"protein": 32,
	"carbs": 0,
	"fats": 4
}
```

**Response:** `200 OK`

```json
{
	"id": "uuid",
	"user_id": "uuid",
	"name": "Grilled Chicken Breast",
	"calories": 170,
	"protein": 32,
	"carbs": 0,
	"fats": 4,
	"serving_size": "100g",
	"image_url": "https://res.cloudinary.com/...",
	"created_at": "2025-01-01T00:00:00Z"
}
```

**Errors:**

- `404` - Food not found
- `400` - Invalid input data
- `401` - Unauthorized

---

### Delete Food Entry

**DELETE** `/foods/{food_id}`

Delete a food entry.

**Headers:**

```http
Authorization: Bearer <token>
```

**Response:** `204 No Content`

**Errors:**

- `404` - Food not found
- `401` - Unauthorized

---

## Analysis Endpoints

### Analyze Food from Image

**POST** `/analyze/analyze-image`

Analyze food image and get nutritional information using AI.

**Headers:**

```http
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**

- `file` (file): Image file (JPEG, PNG)
- `serving_size` (string, optional): Estimated serving size

**Response:** `200 OK`

```json
{
	"success": true,
	"data": {
		"food_name": "Grilled Salmon",
		"confidence": 0.95,
		"nutrition": {
			"calories": 206,
			"protein": 22,
			"carbs": 0,
			"fats": 13
		},
		"ingredients": ["Salmon", "Olive oil", "Lemon", "Herbs"],
		"serving_size": "150g",
		"image_url": "https://res.cloudinary.com/..."
	}
}
```

**Errors:**

- `400` - Invalid file format or size
- `401` - Unauthorized
- `500` - AI service error

---

### Upload and Analyze Food Image

**POST** `/analyze/upload-and-analyze-image`

Upload food image to cloud storage and analyze nutritional content.

**Headers:**

```http
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**

- `file` (file): Image file (JPEG, PNG)

**Response:** `200 OK`

```json
{
	"success": true,
	"data": {
		"food_name": "Grilled Salmon",
		"confidence": 0.95,
		"nutrition": {
			"calories": 206,
			"protein": 22,
			"carbs": 0,
			"fats": 13
		},
		"ingredients": ["Salmon", "Olive oil", "Lemon", "Herbs"],
		"serving_size": "150g",
		"image_url": "https://res.cloudinary.com/..."
	}
}
```

**Errors:**

- `400` - Invalid file format or size
- `401` - Unauthorized
- `500` - AI service error or upload failed

---

### Get Meal Detail

**GET** `/analyze/meals/{meal_id}`

Retrieve detailed information about a specific meal.

**Headers:**

```http
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
	"id": "uuid",
	"user_id": "uuid",
	"meal_name": "Grilled Salmon",
	"image_url": "https://res.cloudinary.com/...",
	"nutrition": {
		"calories": 206,
		"protein": 22,
		"carbs": 0,
		"fats": 13
	},
	"ingredients": ["Salmon", "Olive oil", "Lemon", "Herbs"],
	"serving_size": "150g",
	"created_at": "2025-01-01T00:00:00Z"
}
```

**Errors:**

- `404` - Meal not found
- `401` - Unauthorized

---

### Get Meal History

**GET** `/analyze/meals`

Get meal history for the authenticated user.

**Headers:**

```http
Authorization: Bearer <token>
```

**Query Parameters:**

- `skip` (integer, optional): Number of records to skip (default: 0)
- `limit` (integer, optional): Maximum number of records to return (default: 100)
- `start_date` (string, optional): Filter meals from this date (YYYY-MM-DD)
- `end_date` (string, optional): Filter meals until this date (YYYY-MM-DD)

**Response:** `200 OK`

```json
{
	"total": 50,
	"items": [
		{
			"id": "uuid",
			"meal_name": "Grilled Salmon",
			"image_url": "https://res.cloudinary.com/...",
			"calories": 206,
			"protein": 22,
			"carbs": 0,
			"fats": 13,
			"created_at": "2025-01-01T00:00:00Z"
		}
	]
}
```

**Errors:**

- `401` - Unauthorized

---

### Get Nutrition Statistics

**GET** `/analyze/nutrition-stats`

Get nutrition statistics for a date range.

**Headers:**

```http
Authorization: Bearer <token>
```

**Query Parameters:**

- `start_date` (string, required): Start date (YYYY-MM-DD)
- `end_date` (string, required): End date (YYYY-MM-DD)

**Response:** `200 OK`

```json
{
	"period": {
		"start": "2025-01-01",
		"end": "2025-01-07"
	},
	"summary": {
		"avg_calories": 2100,
		"avg_protein": 150,
		"avg_carbs": 200,
		"avg_fats": 70,
		"total_meals": 21
	},
	"daily_breakdown": [
		{
			"date": "2025-01-01",
			"calories": 2200,
			"protein": 160,
			"carbs": 210,
			"fats": 75,
			"meals": 3
		}
	]
}
```

---

## Nutrition Advice Endpoints

### Stream AI Nutrition Advice

**POST** `/advice/stream`

Get personalized nutrition advice from AI with streaming support.

**Headers:**

```http
Authorization: Bearer <token>
```

**Request Body:**

```json
{
	"query": "What should I eat to increase protein intake?",
	"context": {
		"current_diet": "vegetarian",
		"allergies": ["nuts"]
	},
	"stream": false
}
```

**Response:** `200 OK`

```json
{
	"advice": "Based on your vegetarian diet, here are protein-rich options...",
	"recommendations": [
		{
			"food": "Greek Yogurt",
			"protein": "10g per 100g",
			"reason": "High protein, easily digestible"
		},
		{
			"food": "Tofu",
			"protein": "8g per 100g",
			"reason": "Complete protein source"
		}
	],
	"session_id": "uuid"
}
```

**Streaming Response (if `stream: true`):**

```
data: {"type": "start", "session_id": "uuid"}
data: {"type": "chunk", "content": "Based on your"}
data: {"type": "chunk", "content": " vegetarian diet..."}
data: {"type": "end"}
```

## Pagination

List endpoints support pagination:

- GET `/meals/`
- GET `/foods/`

**Query Parameters:**

- `skip`: Number of items to skip (default: 0)
- `limit`: Maximum items to return (default: 100, max: 1000)

**Response:**

```json
{
  "total": 500,
  "skip": 0,
  "limit": 100,
  "items": [...]
}
```

---

## Interactive Documentation

For interactive API documentation with try-it-out functionality:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## Postman Collection

Import the Postman collection for easy API testing:

```
back-end/Macro_Mate_Profile_API.postman_collection.json
```

---

## Examples

### Python

```python
import requests

BASE_URL = "http://localhost:8000"

# Login
response = requests.post(f"{BASE_URL}/auth/login", json={
    "username": "user",
    "password": "pass"
})
token = response.json()["access_token"]

# Get profile
headers = {"Authorization": f"Bearer {token}"}
profile = requests.get(f"{BASE_URL}/profile/me", headers=headers)
print(profile.json())
```

### JavaScript/TypeScript

```typescript
const BASE_URL = "http://localhost:8000";

// Login
const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
	method: "POST",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify({ username: "user", password: "pass" }),
});
const { access_token } = await loginResponse.json();

// Get profile
const profileResponse = await fetch(`${BASE_URL}/profile/me`, {
	headers: { Authorization: `Bearer ${access_token}` },
});
const profile = await profileResponse.json();
```

---

For more information, see:

- [Architecture Documentation](./ARCHITECTURE.md)
- [Contributing Guide](../CONTRIBUTING.md)
