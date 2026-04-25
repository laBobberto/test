from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.connection import Base, engine
from api import auth, user, plan, events, activities

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LifeBalance SPb API",
    description="Personal urban assistant for Saint Petersburg",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(user.router)
app.include_router(plan.router)
app.include_router(events.router)
app.include_router(activities.router)

@app.get("/")
async def root():
    return {
        "message": "LifeBalance SPb API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
