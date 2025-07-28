# Development Setup Guide

## Backend

1. Install Python dependencies:
   ```bash
   uv sync
   ```

2. Set up environment variables in `backend/.env`.

3. Run migrations:
   ```bash
   uv run python manage.py migrate
   ```

4. Create a superuser:
   ```bash
   uv run python manage.py createsuperuser
   ```

5. Start the backend server:
   ```bash
   uv run python manage.py runserver
   ```

## Frontend

1. Install Node dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Set up environment variables in `frontend/.env`.

3. Start the frontend server:
   ```bash
   npm run dev
   ```

## Running Tests

- **Backend**:
  ```bash
  python manage.py test
  ```
- **Frontend**:
  ```bash
  npm run test
  ```

## Useful Tips

- Use Docker Compose for an isolated environment.
- Update `.env` files for custom configuration.
- For production, switch to PostgreSQL or MySQL and set `DEBUG=False`.
