from pathlib import Path
import os
from dotenv import load_dotenv
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_community.vectorstores import FAISS
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate

# Load env variables
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=BASE_DIR / ".env.local")

GOOGLE_API_KEY = os.getenv("GEMINI_API_KEY")
if not GOOGLE_API_KEY:
    # Fallback to .env in current dir
    load_dotenv()
    GOOGLE_API_KEY = os.getenv("GEMINI_API_KEY")

class RAGService:
    def __init__(self):
        self.embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=GOOGLE_API_KEY)
        self.vector_store_path = BASE_DIR / "backend" / "faiss_index"
        self.knowledge_base_path = BASE_DIR / "backend" / "knowledge_base" / "nexor_data.txt"
        self.vector_store = None
        self.agent_chain = None
        
        # Initialize
        self._initialize_vector_store()
        self._initialize_agent()

    def _initialize_vector_store(self):
        """
        Loads the FAISS index if it exists, otherwise creates it from the knowledge base.
        """
        if self.vector_store_path.exists() and (self.vector_store_path / "index.faiss").exists():
            print("DEBUG: Loading existing FAISS index...")
            self.vector_store = FAISS.load_local(
                str(self.vector_store_path), 
                self.embeddings,
                allow_dangerous_deserialization=True # Local file is safe
            )
        else:
            print("DEBUG: Creating new FAISS index from knowledge base...")
            self._create_vector_store()

    def _create_vector_store(self):
        """
        Ingests data from knowledge_base/nexor_data.txt and creates a FAISS index.
        """
        if not self.knowledge_base_path.exists():
            print(f"Error: Knowledge base file not found at {self.knowledge_base_path}")
            return

        loader = TextLoader(str(self.knowledge_base_path))
        documents = loader.load()
        
        text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        texts = text_splitter.split_documents(documents)
        
        self.vector_store = FAISS.from_documents(texts, self.embeddings)
        self.vector_store.save_local(str(self.vector_store_path))
        print("DEBUG: FAISS index created and saved.")

    def _initialize_agent(self):
        """
        Sets up the LangChain RetrievalQA chain with a custom prompt.
        """
        if not self.vector_store:
            print("Error: Vector store not initialized.")
            return

        llm = ChatGoogleGenerativeAI(model="gemini-pro", google_api_key=GOOGLE_API_KEY, temperature=0.3)
        
        retriever = self.vector_store.as_retriever(search_kwargs={"k": 3})
        
        prompt_template = """
        You are an expert AI Assistant for "Nexor Navigator", a career development platform.
        Your goal is to assist users by answering questions based strictly on the provided context.
        
        Context:
        {context}
        
        Question: {question}
        
        Instructions:
        1. Answer strictly based on the context above.
        2. If the answer is not in the context, DO NOT hallucinatie. Instead, reply EXACTLY with:
           "I don't have the specific details for that right now. I'll check with the senior team/project lead and get back to you."
        3. Be professional, technical, and helpful.
        4. Keep answers concise.
        
        Answer:
        """
        
        PROMPT = PromptTemplate(
            template=prompt_template, input_variables=["context", "question"]
        )
        
        self.agent_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=retriever,
            chain_type_kwargs={"prompt": PROMPT}
        )

    def get_response(self, query: str):
        """
        Generates a response for the user query.
        """
        if not self.agent_chain:
            return "Agent not initialized properly."
            
        try:
            print(f"DEBUG: Processing RAG query: {query}")
            response = self.agent_chain.invoke({"query": query})
            return response["result"]
        except Exception as e:
            print(f"Error in RAG generation: {e}")
            return "I encountered an error processing your request. Please try again."

# Singleton instance
rag_service = RAGService()
