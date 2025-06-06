from fastapi import FastAPI, File, UploadFile, HTTPException
from dotenv import load_dotenv
from langchain_community.document_loaders import WebBaseLoader, PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_qdrant import QdrantVectorStore
from langchain_openai import OpenAIEmbeddings
from openai import OpenAI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import os
import tempfile
import uuid

load_dotenv()
QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")

class IngestRequest(BaseModel):
    url: str

class QueryRequest(BaseModel):
    query: str
    collection_name: str

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://rag-a-web.nawin.xyz",
    "https://rag-a-web.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI!"}

@app.get("/health")
def health_check():
    return {"status": "OK"}

@app.post('/ingestweb')
def ingest_data(request: IngestRequest):
    url = request.url
    if not url:
        return {"error": "URL is required for ingestion."}
    try:
        loader = WebBaseLoader(url)
        docs = loader.load()
        domain_name = url.split("//")[-1].split("/")[0];
        collection_name = f"{domain_name}_vectors"
        print(f"Collection Name: {collection_name}")
        # Chunking
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=400
        )
        split_docs = text_splitter.split_documents(docs)
        print(f"Number of chunks created: {len(split_docs)}")
        # Embedding Model
        embedding_model = OpenAIEmbeddings(
            model="text-embedding-3-large"
        )
        print("Embedding model initialized.")
        # Vector Store with Qdrant
        vector_store = QdrantVectorStore.from_documents(
            documents=split_docs,
            url=QDRANT_URL,
            collection_name=f"{collection_name}",
            embedding=embedding_model,
            prefer_grpc=False,
            api_key=QDRANT_API_KEY
        )
        print("Vector store created and data ingested.", vector_store)
        print(f"Data ingested into collection: {collection_name}")
        return {"your_url": f"{url}", "collection_name": f"{collection_name}", "message": "Ingestion completed successfully."}
    except Exception as e:
        return {"error": f"An error occurred during ingestion: {str(e)}"}

@app.post('/ingestfile')
async def ingest_file(file: UploadFile = File(...)):
    # Validate file type
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")
    
    # Check file size (10MB limit)
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB in bytes
    
    try:
        # Read file content to check size
        file_content = await file.read()
        if len(file_content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File size exceeds 10MB limit.")
        
        # Reset file pointer
        await file.seek(0)
        
        # Create a temporary file to save the uploaded PDF
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
            temp_file.write(file_content)
            temp_file_path = temp_file.name
        
        try:
            # Load PDF using PyPDFLoader
            loader = PyPDFLoader(temp_file_path)
            docs = loader.load()
            
            # Generate collection name from filename
            base_filename = os.path.splitext(file.filename)[0]
            # Clean filename for collection name (remove special characters)
            clean_filename = "".join(c for c in base_filename if c.isalnum() or c in ('-', '_')).lower()
            collection_name = f"{clean_filename}_pdf_vectors"
            
            print(f"Collection Name: {collection_name}")
            print(f"Number of pages loaded: {len(docs)}")
            
            # Chunking
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=400
            )
            split_docs = text_splitter.split_documents(docs)
            print(f"Number of chunks created: {len(split_docs)}")
            
            # Add filename metadata to each chunk
            for doc in split_docs:
                doc.metadata['filename'] = file.filename
                doc.metadata['source_type'] = 'pdf'
            
            # Embedding Model
            embedding_model = OpenAIEmbeddings(
                model="text-embedding-3-large"
            )
            print("Embedding model initialized.")
            
            # Vector Store with Qdrant
            vector_store = QdrantVectorStore.from_documents(
                documents=split_docs,
                url=QDRANT_URL,
                collection_name=collection_name,
                embedding=embedding_model,
                prefer_grpc=False,
                api_key=QDRANT_API_KEY
            )
            print("Vector store created and data ingested.", vector_store)
            print(f"Data ingested into collection: {collection_name}")
            
            return {
                "filename": file.filename,
                "collection_name": collection_name,
                "message": "PDF ingestion completed successfully.",
                "chunks_created": len(split_docs),
                "pages_processed": len(docs)
            }
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
                
    except HTTPException:
        raise
    except Exception as e:
        return {"error": f"An error occurred during PDF ingestion: {str(e)}"}

@app.post('/query')
def query_data(request: QueryRequest):
    query = request.query
    collection_name = request.collection_name
    print(f"Query: {query}, Collection Name: {collection_name}")
    
    if not query:
        raise HTTPException(status_code=400, detail="Query is required.")
    if not collection_name:
        raise HTTPException(status_code=400, detail="Collection name is not set. Please ingest data first.")
    
    try:
        import requests 
        print(f"Checking if collection '{collection_name}' exists in Qdrant...")

        headers = {
            "api-key": QDRANT_API_KEY,
            "accept": "application/json"
        }

        response = requests.get(
            f"{QDRANT_URL}/collections/{collection_name}",
            headers=headers
        )

        print(f"Response: {response}")
        print(f"Response status code: {response.status_code}")

        if response.status_code == 404:
            raise HTTPException(
                status_code=404, 
                detail=f"Collection '{collection_name}' not found. Please ingest data first using /ingestweb or /ingestfile endpoints."
            )
        elif response.status_code != 200:
            raise HTTPException(
                status_code=500, 
                detail=f"Error checking collection '{collection_name}': {response.status_code}"
            )

        # Initialize OpenAI client
        client = OpenAI()

        # Vector Embeddings
        embedding_model = OpenAIEmbeddings(
            model="text-embedding-3-large"
        )

        # Vector DB
        vector_db = QdrantVectorStore.from_existing_collection(
            url=QDRANT_URL,
            collection_name=collection_name,
            embedding=embedding_model,
            prefer_grpc=False,
            api_key=QDRANT_API_KEY
        )
        print("Vector store initialized for querying.")

        # Similarity Search
        search_results = vector_db.similarity_search(query=query)

        print(f"Number of search results: {len(search_results)}")

        if not search_results:
            return {"response": "No relevant information found for your query in the ingested data."}

        # Build context differently based on source type
        context_parts = []
        for result in search_results:
            metadata = result.metadata
            source_info = ""
            
            # Check if it's from a PDF file
            if metadata.get('source_type') == 'pdf':
                source_info = f"Source: {metadata.get('filename', 'Unknown PDF')}"
                if 'page' in metadata:
                    source_info += f" (Page {metadata['page']})"
            # Check if it's from a web source
            elif 'source' in metadata:
                source_info = f"Source URL: {metadata['source']}"
            else:
                source_info = "Source: N/A"
            
            context_parts.append(f"Content: {result.page_content}\n{source_info}")

        context = "\n\n---\n\n".join(context_parts)

        # Determine source type for system prompt
        is_pdf_source = any(result.metadata.get('source_type') == 'pdf' for result in search_results)
        is_web_source = any('source' in result.metadata and result.metadata.get('source_type') != 'pdf' for result in search_results)

        if is_pdf_source and is_web_source:
            source_description = "provided documents and web content"
        elif is_pdf_source:
            source_description = "provided PDF document(s)"
        else:
            source_description = "provided web content"

        SYSTEM_PROMPT = f"""
        You are a helpful AI assistant. You answer the user's query based **only** on the {source_description}.

        Each piece of context comes from a specific source. Help the user by answering their query and referencing the appropriate sources when relevant.

        Context:
        {context}
        """
        print("System prompt created for chat completion.")

        chat_completion = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": query},
            ]
        )

        print("Chat completion response received.")
        if not chat_completion.choices:
            raise HTTPException(status_code=500, detail="No response generated by the model.")
        
        return {"response": chat_completion.choices[0].message.content}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error during querying: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred during querying: {str(e)}")