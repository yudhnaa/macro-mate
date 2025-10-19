from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth
from database.init_db import init_db

app = FastAPI(title="Macro Mate API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Thay bằng domain cụ thể trong production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()

# Include routers
app.include_router(auth.router)


@app.get("/")
async def root():
    return {"message": "Welcome to Macro Mate API"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}