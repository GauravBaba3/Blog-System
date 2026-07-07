# Full Stack Blog System

A beginner-friendly portfolio project: **React (Vite)** frontend + **Django REST Framework** backend with **JWT authentication**.

## Tech Stack

- **Backend:** Python, Django, DRF, SQLite, Simple JWT
- **Frontend:** React, Vite, JavaScript, Redux Toolkit, Axios, React Router

## Project Structure

```
blog system/
├── backend/          # Django REST API
│   ├── config/       # Project settings & URLs
│   ├── accounts/     # Auth & profile APIs
│   ├── blog/         # Blog, comments, likes, categories
│   └── media/        # Uploaded images
├── frontend/         # React Vite SPA
│   └── src/
│       ├── api/      # Axios API calls
│       ├── components/
│       ├── pages/
│       └── store/    # Redux auth state
└── docs/             # Models, API docs, roadmap
```

## How to Run Locally

### 1. Backend (Terminal 1)

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_categories
python manage.py createsuperuser   # optional — for Django admin
python manage.py runserver
```

Backend runs at: **http://127.0.0.1:8000**  
Admin panel: **http://127.0.0.1:8000/admin/**

### 2. Frontend (Terminal 2)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

## API Documentation

See `docs/API_ENDPOINTS.md` for all routes.

| Feature | Method | Endpoint |
|---------|--------|----------|
| Register | POST | `/api/auth/register/` |
| Login | POST | `/api/auth/login/` |
| Profile | GET/PATCH | `/api/auth/profile/` |
| List blogs | GET | `/api/blogs/` |
| Create blog | POST | `/api/blogs/` |
| Like blog | POST | `/api/blogs/{slug}/like/` |
| Comment | POST | `/api/blogs/{slug}/comments/` |

## Features

- User registration, login, logout (JWT)
- Protected routes in React
- Profile edit & password change
- Blog CRUD (create, read, update, delete)
- Like / unlike posts
- Comments (add & delete own)
- Search, category filter, pagination
- Latest posts sidebar

## React ↔ Django Flow

1. User submits login form in React
2. Axios sends `POST /api/auth/login/` to Django
3. Django validates credentials, returns JWT tokens as JSON
4. React stores tokens in `localStorage`
5. All protected requests include `Authorization: Bearer <token>`

## Docs

- [Database Models](docs/MODELS.md)
- [API Endpoints](docs/API_ENDPOINTS.md)
- [Development Roadmap](docs/ROADMAP.md)
