# Feedback Management System

A comprehensive feedback management application built with Django REST Framework backend and React frontend.

---

## Features

### Backend (Django REST Framework)
- **User Management:** Registration, login, JWT authentication with role-based permissions (admin, moderator, contributor)
- **Board Management:** Create and manage feedback boards with public/private visibility
- **Feedback System:** CRUD operations for feedback with voting, comments, status tracking, and priority levels
- **Analytics:** Dashboard with feedback counts, trends, and top-voted items
- **Tags:** Organize feedback with tags
- **Comments:** Threaded commenting system on feedback items

### Frontend (React + Tailwind CSS)
- **Responsive Design:** Modern, clean UI that works on all devices
- **Dashboard:** Overview with statistics and quick actions
- **Feedback Views:** Table and Kanban board views with drag-and-drop functionality
- **Real-time Updates:** Live feedback status updates and voting
- **Theme Support:** Light/dark mode toggle
- **Role-based UI:** Different interfaces for admins, moderators, and contributors

---

## Getting Started

Use `.env.example` to create a `.env` file.

---

## Quick Start with Docker Compose

1. **Build and start all services:**
   ```bash
   docker-compose up --build
   ```

2. **Access the API:**  
   [http://localhost:8000/](http://localhost:8000/)

3. **Access the frontend:**  
   [http://localhost:3000/](http://localhost:3000/)

---


## API Documentation

The API is fully documented and includes endpoints for:

- **Authentication:** `/api/users/login/`, `/api/users/register/`
- **User Management:** `/api/users/`, `/api/users/me/`
- **Boards:** `/api/boards/` (with join/leave actions)
- **Feedback:** `/api/feedback/` (with voting and filtering)
- **Comments:** `/api/comments/`
- **Tags:** `/api/tags/`
- **Analytics:** `/api/feedback/counts/`, `/api/feedback/top_voted/`, `/api/feedback/trends/`

Detailed API documentation is available in `API_DOCUMENTATION.md`.

---

## Deployment Notes

1. **Backend:** Configure proper database, set `DEBUG=False`, configure `ALLOWED_HOSTS`
2. **Frontend:** Build static files and serve from web server
3. **Environment:** Set proper CORS settings and API URLs
4. **Database:** Use PostgreSQL or MySQL for production

---

## Local Development Setup

See [DEVELOPMENT_SETUP.md](docs/DEVELOPMENT_SETUP.md) for a detailed guide on setting up your environment, running tests, and using advanced features.

---