# mkrl TinyURL Clone

## Project Structure

- `frontend/`: React + Vite application
- `backend/`: FastAPI + Python application

## Getting Started

### Prerequisites

- Node.js (v18+)
- Python (v3.8+)
- Postgres Database (e.g., Neon - Free)
- Redis (e.g., Upstash - Free)

### Backend Setup

1. Navigate to `backend`:
   ```bash
   cd backend
   ```

2. Create a virtual environment and activate it:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file in `backend/` with your credentials:
   ```
   DATABASE_URL=postgresql://user:password@host:port/dbname
   REDIS_URL=redis://default:password@host:port
   ```

5. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```
   The API will be available at `http://localhost:8000`.

### Frontend Setup

1. Navigate to `frontend`:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```
   The UI will be available at `http://localhost:5173`.

## Deployment

### Vercel

This project is configured for Vercel deployment.

- **Frontend**: Deploy `frontend` directory as a standard Vite React app.
- **Backend**: Deploy `backend` directory. ensure the Build Command is empty and Output Directory is default. Add `DATABASE_URL` and `REDIS_URL` to Vercel Environment Variables.

