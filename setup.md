# Quick Setup Guide

## 🚀 Running the Project Locally

### 1. Set up your OpenAI API Key

Edit `fastapi-server/.env` and replace `your_openai_api_key_here` with your actual OpenAI API key:

```bash
OPENAI_API_KEY=sk-your-actual-api-key-here
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=
```

### 2. Run with Docker (Recommended)

```bash
# From the project root directory
docker-compose up --build
```

This will start:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8888
- Qdrant Vector DB: http://localhost:6333

### 3. Run Manually (Alternative)

#### Backend:
```bash
cd fastapi-server
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8888
```

#### Frontend:
```bash
cd client
npm install
npm run dev
```

#### Qdrant (separate terminal):
```bash
docker run -p 6333:6333 qdrant/qdrant
```

## 🔧 Fixes Applied

- ✅ Removed hardcoded third-party URLs (nawin.xyz, vercel.app)
- ✅ Created environment files for local development
- ✅ Fixed CORS settings for local development
- ✅ Added Docker setup for full stack

## 🌟 Get Your OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Replace `your_openai_api_key_here` in `fastapi-server/.env`

That's it! Your RAG Chatter should now work locally! 🎉 