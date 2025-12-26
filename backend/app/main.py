from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from .db import get_db_connection
from .redis import get_redis_client
from .base62 import encode
import time

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ShortenRequest(BaseModel):
    long_url: HttpUrl

@app.get("/api")
def read_root():
    return {"message": "Welcome to mkrl TinyURL"}

@app.post("/api/shorten")
async def shorten(request: ShortenRequest):
    long_url_str = str(request.long_url)
    
    conn = await get_db_connection()
    redis_client = get_redis_client()
    
    try:
        # Insert to get ID
        # Using RETURNING id
        row = await conn.fetchrow(
            "INSERT INTO urls (long_url) VALUES ($1) RETURNING id",
            long_url_str
        )
        url_id = row['id']
        
        # Encode
        short_code = encode(url_id)
        
        # Update with short_code
        await conn.execute(
            "UPDATE urls SET short_code = $1 WHERE id = $2",
            short_code, url_id
        )
        
        # Cache in Redis
        # Key: mkrl:{short_code}
        await redis_client.set(f"mkrl:{short_code}", long_url_str, ex=86400) # 24h TTL
        
        return {"short_code": short_code}
        
    finally:
        await conn.close()
        await redis_client.aclose()

@app.get("/{code}")
async def redirect_to_url(code: str):
    redis_client = get_redis_client()
    
    # Check Redis
    cached_url = await redis_client.get(f"mkrl:{code}")
    if cached_url:
        await redis_client.aclose()
        return RedirectResponse(url=cached_url.decode('utf-8'), status_code=301)
    
    conn = await get_db_connection()
    try:
        # Check DB
        row = await conn.fetchrow(
            "SELECT long_url FROM urls WHERE short_code = $1",
            code
        )
        
        if row:
            long_url = row['long_url']
            # Cache in Redis
            await redis_client.set(f"mkrl:{code}", long_url, ex=86400)
            await redis_client.aclose()
            return RedirectResponse(url=long_url, status_code=301)
        else:
            await redis_client.aclose()
            raise HTTPException(status_code=404, detail="Short URL not found")
            
    finally:
        await conn.close()

