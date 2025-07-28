# Feedback Management System

A comprehensive feedback management application built with Django REST Framework backend and React frontend.

## Features

### Backend (Django REST Framework)
- **User Management**: Registration, login, JWT authentication with role-based permissions (admin, moderator, contributor)
- **Board Management**: Create and manage feedback boards with public/private visibility
- **Feedback System**: CRUD operations for feedback with voting, comments, status tracking, and priority levels
- **Analytics**: Dashboard with feedback counts, trends, and top-voted items
- **Tags**: Organize feedback with tags
- **Comments**: Threaded commenting system on feedback items

### Frontend (React + Tailwind CSS)
- **Responsive Design**: Modern, clean UI that works on all devices
- **Dashboard**: Overview with statistics and quick actions
- **Feedback Views**: Table and Kanban board views with drag-and-drop functionality
- **Real-time Updates**: Live feedback status updates and voting
- **Theme Support**: Light/dark mode toggle
- **Role-based UI**: Different interfaces for admins, moderators, and contributors

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   uv install
   ```

3. Run database migrations:
   ```bash
   uv run python manage.py migrate
   ```

4. Create a superuser (admin):
   ```bash
   uv runpython manage.py createsuperuser
   ```

5. Start the development server:
   ```bash
   uv run python manage.py runserver
   ```

The API will be available at `http://localhost:8000/`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173/`

## Default Users & Roles

### User Roles
- **Admin**: Full system access, can manage all resources
- **Moderator**: Can manage boards and all feedback
- **Contributor**: Can create feedback and comments on accessible boards

### Getting Started as Admin
1. Create a superuser account using Django admin: `python manage.py createsuperuser`
2. Login to the web application with these credentials
3. Create your first board from the "Boards" section
4. Invite users or make boards public for others to join

## API Documentation

The API is fully documented and includes endpoints for:

- **Authentication**: `/api/users/login/`, `/api/users/register/`
- **User Management**: `/api/users/`, `/api/users/me/`
- **Boards**: `/api/boards/` (with join/leave actions)
- **Feedback**: `/api/feedback/` (with voting and filtering)
- **Comments**: `/api/comments/`
- **Tags**: `/api/tags/`
- **Analytics**: `/api/feedback/counts/`, `/api/feedback/top_voted/`, `/api/feedback/trends/`

Detailed API documentation is available in `API_DOCUMENTATION.md`.

## Application Structure

### Frontend Pages
- **Login/Register**: User authentication
- **Dashboard**: Overview with statistics and quick actions
- **Feedback List**: Table and Kanban views of all feedback
- **Feedback Details**: Individual feedback view with comments and voting
- **Create Feedback**: Form to submit new feedback
- **Board Management**: Manage boards and memberships
- **Create Board**: Form to create new boards (admin/moderator only)

### Key Features
1. **Responsive Navigation**: Consistent navbar across all pages
2. **Role-based Access**: Different features available based on user role
3. **Real-time Interactions**: Vote on feedback, add comments, update status
4. **Drag & Drop**: Kanban board with status updates via drag and drop
5. **Search & Filter**: Filter feedback by status, priority, search terms
6. **Dark Mode**: Toggle between light and dark themes

## Environment Variables

### Backend (.env)
```
SECRET_KEY=your-secret-key
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000/api
```

## Project Architecture

### Backend
- **Django REST Framework**: API development
- **JWT Authentication**: Secure token-based auth
- **SQLite**: Default database (configurable)
- **CORS**: Configured for frontend integration

### Frontend
- **React 19**: Modern React with hooks
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first styling
- **Axios**: HTTP client for API calls
- **Vite**: Fast build tool and dev server

## Development Commands

### Backend
```bash
# Run server
python manage.py runserver

# Run migrations
python manage.py migrate

# Create migrations
python manage.py makemigrations

# Create superuser
python manage.py createsuperuser

# Run tests
python manage.py test
```

### Frontend
```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Deployment Notes

1. **Backend**: Configure proper database, set DEBUG=False, configure ALLOWED_HOSTS
2. **Frontend**: Build static files and serve from web server
3. **Environment**: Set proper CORS settings and API URLs
4. **Database**: Use PostgreSQL or MySQL for production