# Feedback Management System API Documentation

## Overview

This is a Django REST Framework-based feedback management system that allows users to create boards, submit feedback, vote on feedback items, and comment on them. The system includes role-based permissions and JWT authentication.

## Table of Contents

1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [Board Management](#board-management)
4. [Feedback Management](#feedback-management)
5. [Comments](#comments)
6. [Tags](#tags)
7. [Analytics](#analytics)
8. [Error Responses](#error-responses)
9. [Data Models](#data-models)

## Base URL

```
http://127.0.0.1:8000/api/
```

## Authentication

The API uses JWT (JSON Web Token) authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_access_token>
```

### Authentication Endpoints

#### Register User
**POST** `/users/register/`

Create a new user account and receive authentication tokens.

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "password_confirm": "string",
  "first_name": "string",
  "last_name": "string"
}
```

**Response:**
```json
{
  "refresh": "string",
  "access": "string",
  "user": {
    "id": 1,
    "username": "string",
    "email": "string",
    "role": "contributor",
    "full_name": "string"
  }
}
```

**Example:**
```bash
curl -X POST http://127.0.0.1:8000/api/users/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "securepassword123",
    "password_confirm": "securepassword123",
    "first_name": "Test",
    "last_name": "User"
  }'
```

#### Login User
**POST** `/users/login/`

Authenticate existing user and receive tokens.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "access": "string",
  "refresh": "string",
  "user": {
    "id": 1,
    "username": "string",
    "email": "string",
    "role": "contributor",
    "full_name": "string"
  }
}
```

**Example:**
```bash
curl -X POST http://127.0.0.1:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "securepassword123"
  }'
```

## User Management

#### Get Current User Profile
**GET** `/users/me/`

Get the current authenticated user's profile information.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": 1,
  "username": "string",
  "email": "string",
  "first_name": "string",
  "last_name": "string",
  "role": "contributor",
  "full_name": "string",
  "date_joined": "2025-07-28T03:26:45.445261Z",
  "is_active": true
}
```

**Example:**
```bash
curl -X GET http://127.0.0.1:8000/api/users/me/ \
  -H "Authorization: Bearer <your_token>"
```

#### List Users
**GET** `/users/`

List all users (Admin/Moderator only).

**Headers:** `Authorization: Bearer <token>`
**Permissions:** Admin or Moderator only

**Response:**
```json
[
  {
    "id": 1,
    "username": "string",
    "email": "string",
    "role": "admin",
    "full_name": "string",
    "date_joined": "2025-07-28T03:26:45.445261Z",
    "is_active": true
  }
]
```

## Board Management

#### List Boards
**GET** `/boards/`

Get all boards accessible to the current user.

**Headers:** `Authorization: Bearer <token>`

**Permissions:**
- Admin/Moderator: See all boards
- Contributor: See public boards and boards they're members of

**Response:**
```json
[
  {
    "id": 1,
    "member_count": 2,
    "feedback_count": 1,
    "name": "Product Feedback",
    "description": "Feedback for our main product",
    "is_public": true,
    "created_at": "2025-07-27T09:21:48.988625Z",
    "updated_at": "2025-07-27T09:21:48.988665Z",
    "members": [1, 2]
  }
]
```

**Example:**
```bash
curl -X GET http://127.0.0.1:8000/api/boards/ \
  -H "Authorization: Bearer <your_token>"
```

#### Create Board
**POST** `/boards/`

Create a new board (Admin/Moderator only).

**Headers:** `Authorization: Bearer <token>`
**Permissions:** Admin or Moderator only

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "is_public": true
}
```

**Response:**
```json
{
  "id": 1,
  "member_count": 0,
  "feedback_count": 0,
  "name": "string",
  "description": "string",
  "is_public": true,
  "created_at": "2025-07-28T03:30:40.648358Z",
  "updated_at": "2025-07-28T03:30:40.648369Z",
  "members": []
}
```

#### Join Board
**POST** `/boards/{id}/join/`

Join a public board.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "Successfully joined board"
}
```

**Example:**
```bash
curl -X POST http://127.0.0.1:8000/api/boards/1/join/ \
  -H "Authorization: Bearer <your_token>"
```

#### Leave Board
**POST** `/boards/{id}/leave/`

Leave a board you're a member of.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "Successfully left board"
}
```

#### Add Member to Board
**POST** `/boards/{id}/add_member/`

Add a user to a board (Admin/Moderator only).

**Headers:** `Authorization: Bearer <token>`
**Permissions:** Admin or Moderator only

**Request Body:**
```json
{
  "username": "string"
}
```

**Response:**
```json
{
  "message": "Added username to board"
}
```

## Feedback Management

#### List Feedback
**GET** `/feedback/`

Get all feedback accessible to the current user.

**Headers:** `Authorization: Bearer <token>`

**Permissions:**
- Admin/Moderator: See all feedback
- Contributor: See feedback from public boards and boards they're members of
- Anonymous: See feedback from public boards only

**Response:**
```json
[
  {
    "id": 1,
    "author_name": "Test User",
    "board_name": "Product Feedback",
    "upvote_count": 1,
    "comment_count": 2,
    "title": "Feature Request",
    "content": "Would love to see this feature implemented",
    "status": "open",
    "priority": "medium",
    "created_at": "2025-07-28T03:30:40.648358Z",
    "updated_at": "2025-07-28T03:30:40.648369Z",
    "board": 1,
    "author": 1,
    "upvotes": [1, 2],
    "tags": []
  }
]
```

**Example:**
```bash
curl -X GET http://127.0.0.1:8000/api/feedback/ \
  -H "Authorization: Bearer <your_token>"
```

#### Create Feedback
**POST** `/feedback/`

Create new feedback on a board.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "board": 1,
  "title": "string",
  "content": "string",
  "priority": "low|medium|high",
  "tags": ["tag1", "tag2"]
}
```

**Response:**
```json
{
  "id": 1,
  "author_name": "Test User",
  "board_name": "Product Feedback",
  "upvote_count": 0,
  "comment_count": 0,
  "title": "string",
  "content": "string",
  "status": "open",
  "priority": "medium",
  "created_at": "2025-07-28T03:30:40.648358Z",
  "updated_at": "2025-07-28T03:30:40.648369Z",
  "board": 1,
  "author": 1,
  "upvotes": [],
  "tags": []
}
```

**Example:**
```bash
curl -X POST http://127.0.0.1:8000/api/feedback/ \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "board": 1,
    "title": "New Feature Request",
    "content": "Please add dark mode support",
    "priority": "medium"
  }'
```

#### Vote on Feedback
**POST** `/feedback/{id}/vote/`

Vote or unvote on a feedback item.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "action": "added|removed",
  "upvotes": 1
}
```

**Example:**
```bash
curl -X POST http://127.0.0.1:8000/api/feedback/1/vote/ \
  -H "Authorization: Bearer <your_token>"
```

#### Get Feedback by ID
**GET** `/feedback/{id}/`

Get a specific feedback item.

**Headers:** `Authorization: Bearer <token>`

**Response:** Same as feedback list item format.

#### Update Feedback
**PUT/PATCH** `/feedback/{id}/`

Update feedback (Author, Admin, or Moderator only).

**Headers:** `Authorization: Bearer <token>`
**Permissions:** Author of feedback, Admin, or Moderator

**Request Body:** Same as create feedback.

#### Delete Feedback
**DELETE** `/feedback/{id}/`

Delete feedback (Author, Admin, or Moderator only).

**Headers:** `Authorization: Bearer <token>`
**Permissions:** Author of feedback, Admin, or Moderator

## Comments

#### List Comments
**GET** `/comments/`

Get all comments accessible to the current user.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "id": 1,
    "author_name": "Test User",
    "content": "Great idea! I support this feature.",
    "created_at": "2025-07-28T03:31:45.860213Z",
    "updated_at": "2025-07-28T03:31:45.860223Z",
    "feedback": 1,
    "author": 1
  }
]
```

#### Create Comment
**POST** `/comments/`

Add a comment to feedback.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "feedback": 1,
  "content": "string"
}
```

**Response:**
```json
{
  "id": 1,
  "author_name": "Test User",
  "content": "string",
  "created_at": "2025-07-28T03:31:45.860213Z",
  "updated_at": "2025-07-28T03:31:45.860223Z",
  "feedback": 1,
  "author": 1
}
```

**Example:**
```bash
curl -X POST http://127.0.0.1:8000/api/comments/ \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "feedback": 1,
    "content": "I agree with this feedback!"
  }'
```

#### Update Comment
**PUT/PATCH** `/comments/{id}/`

Update a comment (Author, Admin, or Moderator only).

#### Delete Comment
**DELETE** `/comments/{id}/`

Delete a comment (Author, Admin, or Moderator only).

## Tags

#### List Tags
**GET** `/tags/`

Get all available tags.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "id": 1,
    "name": "bug"
  },
  {
    "id": 2,
    "name": "feature-request"
  }
]
```

#### Create Tag
**POST** `/tags/`

Create a new tag.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "string"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "bug"
}
```

**Example:**
```bash
curl -X POST http://127.0.0.1:8000/api/tags/ \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "enhancement"}'
```

## Analytics

#### Feedback Counts
**GET** `/feedback/counts/`

Get feedback counts by status.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "total": 10,
  "active": 7,
  "completed": 2,
  "in_progress": 1,
  "under_review": 0
}
```

**Example:**
```bash
curl -X GET http://127.0.0.1:8000/api/feedback/counts/ \
  -H "Authorization: Bearer <your_token>"
```

#### Top Voted Feedback
**GET** `/feedback/top_voted/`

Get the top 5 most voted feedback items.

**Headers:** `Authorization: Bearer <token>`

**Response:** Array of feedback objects sorted by upvote count.

**Example:**
```bash
curl -X GET http://127.0.0.1:8000/api/feedback/top_voted/ \
  -H "Authorization: Bearer <your_token>"
```

#### Feedback Trends
**GET** `/feedback/trends/`

Get feedback submission trends for the last 30 days.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "day": "2025-07-28",
    "count": 5
  },
  {
    "day": "2025-07-27",
    "count": 3
  }
]
```

## Error Responses

### Common HTTP Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required or invalid token
- `403 Forbidden` - Permission denied
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

### Error Response Format

```json
{
  "detail": "Error message",
  "field_name": ["Field-specific error message"]
}
```

### Authentication Errors

```json
{
  "detail": "Authentication credentials were not provided."
}
```

```json
{
  "detail": "Given token not valid for any token type",
  "code": "token_not_valid"
}
```

### Permission Errors

```json
{
  "detail": "You do not have permission to perform this action."
}
```

### Validation Errors

```json
{
  "username": ["A user with that username already exists."],
  "password": ["This password is too short. It must contain at least 8 characters."]
}
```

## Data Models

### User Roles

- `admin` - Full system access
- `moderator` - Can manage boards and all feedback
- `contributor` - Can create feedback and comments on accessible boards

### Feedback Status Options

- `open` - New feedback (default)
- `in_progress` - Being worked on
- `under_review` - Under review
- `completed` - Completed
- `rejected` - Rejected

### Feedback Priority Options

- `low` - Low priority
- `medium` - Medium priority (default)
- `high` - High priority

## Rate Limiting

Currently, there are no rate limits implemented, but it's recommended to implement them in production.

## Pagination

List endpoints support Django REST Framework's default pagination. Use query parameters:

- `?page=2` - Get page 2
- `?page_size=20` - Set page size (if allowed)

## Filtering and Ordering

Feedback can be filtered and ordered using query parameters:

- `?status=open` - Filter by status
- `?priority=high` - Filter by priority
- `?board=1` - Filter by board
- `?ordering=-created_at` - Order by creation date (newest first)
- `?ordering=upvote_count` - Order by upvote count

Example:
```bash
curl -X GET "http://127.0.0.1:8000/api/feedback/?status=open&ordering=-created_at" \
  -H "Authorization: Bearer <your_token>"
```

## Admin Interface

The system includes a Django admin interface available at:

```
http://127.0.0.1:8000/admin/
```

Admin users can:
- Manage users and their roles
- Create and manage boards
- Moderate feedback and comments
- Manage tags
- View system statistics

## Getting Started

1. **Register a new user:**
   ```bash
   curl -X POST http://127.0.0.1:8000/api/users/register/ \
     -H "Content-Type: application/json" \
     -d '{
       "username": "myuser",
       "email": "user@example.com",
       "password": "securepassword123",
       "password_confirm": "securepassword123",
       "first_name": "My",
       "last_name": "User"
     }'
   ```

2. **Login to get access token:**
   ```bash
   curl -X POST http://127.0.0.1:8000/api/users/login/ \
     -H "Content-Type: application/json" \
     -d '{
       "username": "myuser",
       "password": "securepassword123"
     }'
   ```

3. **Use the access token for authenticated requests:**
   ```bash
   curl -X GET http://127.0.0.1:8000/api/boards/ \
     -H "Authorization: Bearer <your_access_token>"
   ```

## Support

For issues or questions, please refer to the project repository or contact the development team.
