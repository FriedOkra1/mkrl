import os
import redis.asyncio as redis
from dotenv import load_dotenv
import ssl

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL")

def get_redis_client():
    if not REDIS_URL:
        # Fallback for local development if not set, or raise error
        return redis.Redis(host='localhost', port=6379, db=0)
    
    # Check if using rediss:// which implies SSL
    if REDIS_URL.startswith("rediss://"):
        return redis.from_url(
            REDIS_URL,
            ssl_cert_reqs=ssl.CERT_NONE 
        )
    
    return redis.from_url(REDIS_URL)
