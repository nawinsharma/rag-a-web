# RAG based Application (Chat with website/pdf)

A modern web application that implements Retrieval-Augmented Generation (RAG) using Next.js for the frontend and FastAPI for the backend. This application allows users to interact with website or pdf.

## Tech Stack

### Frontend
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- Zustand (State Management)
- Axios (HTTP Client)

### Backend
- FastAPI
- LangChain
- OpenAI
- Qdrant (Vector Database)
- Uvicorn

## Prerequisites

- Node.js (Latest LTS version)
- Python 3.8+
- Docker and Docker Compose (for containerized deployment)

## Getting Started

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   # or
   bun install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   pnpm dev
   # or
   bun run dev
   ```

### Backend Setup

1. Navigate to the fastapi-server directory:
   ```bash
   cd fastapi-server
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Docker Deployment

1. Build and start the containers:
   ```bash
   docker-compose up --build
   ```

## Features

- Modern, responsive UI with Tailwind CSS
- Real-time document processing
- Vector-based document retrieval
- AI-powered text generation
- File upload and processing
- Interactive chat interface

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 